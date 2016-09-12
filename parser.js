'use strict';
const ast = require('./ast');

const debug = {
  depth: false
};

const globalDebugEnabled = false;
let results = null;
let functions = {};

functions.hello = function() {
  return 'hello world';
}

function isValueLookupExpression(item) {
  if ( Object.keys(item)[0] === '$value') {
    return true;
  }
  return false;
}

function isConcatExpression(item) {
  if ( Object.keys(item)[0] === '$concat') {
    return true;
  }
  return false;
}

function isFunctionExpression(item) {
  if ( Object.keys(item)[0] === '$function') {
    return true;
  }
  return false;
}
function isProcessEnvExpression(item) {
  if ( Object.keys(item)[0] === '$process.env') {
    return true;
  }
  return false;
}

function evalConcatExpression(ctx) {
  let result = '';
  for(let arrayItem of ctx.item['$concat']) {
    if (arrayItem[0] !== '$') {
      result = result + arrayItem;
    } else {
      if (ctx.expression.debug === true) {
        console.log('concat arrayItem:' + arrayItem);
      }
      if (ctx.expression.debug === true) {
        if (ctx.parseContext.flattenedTree[arrayItem]) {
          console.log('value in flattenedTree');
        } else {
          console.log('no value in flattenedTree');
        }
      }
      result = result + ctx.parseContext.flattenedTree[arrayItem];
    }
  }

  ctx.parseContext.flattenedTree[ctx.currentItemPath()] = result;
  return result;
}

function evalFunctionExpression(ctx) {
  let func = functions[ctx.item['$function']];
  let args = null;

  if (!func) { // no built in function
    if (ctx.parseContext.options && ctx.parseContext.options.functions) {
      func = ctx.parseContext.options.functions[ctx.item['$function']];
    }
    // if no custom function then throw an exception
    if (!func) {
      throw new Error(`evalFunctionExpression: function not defined ${ctx.item['$function']}`, ctx);
    }

    // if there are args, pass that into the function
    if (ctx.item['args']) {
      args = ctx.item['args'];
    }
  }

  const options = {};
  options.currentItem = ctx.item;
  options.currentItemParent = ctx.parent;
  options.ctx = ctx;
  const value = func(args, options);
  ctx.parseContext.flattenedTree[ctx.currentItemPath()] = value;
  return value;
}


// converts a $value function to it's actual value and updates the global
function evalValueExpression(ctx) {

  if (typeof ctx.item !== 'object') {
    throw new Error('evalValueExpression expects ctx.item is be an object', ctx);
  }
  if (Object.keys(ctx.item).length !== 1) {
    throw new Error(`evalValueExpression expects ctx.item to be an object with 1 key, found ${Object.keys(ctx.item).length}`, ctx);
  }

  if (ctx.item['$value'] === null) {
    throw new Error(`evalValueExpression expects $value key`, ctx);
  }

  if (ctx.expression.debug === true) {
    console.log('$value is ' + ctx.item['$value']);
  }

  // if there is not definition for the value referenced, blow up
  if (!ctx.parseContext.flattenedTree[ctx.item['$value']]) {
    throw new Error(`$value references [${ctx.item['$value']}] not found in global variable list (flattenedTree)`);
  }
  const value = ctx.parseContext.flattenedTree[ctx.item['$value']];

  if (ctx.expression.debug === true) {
    console.log(`looked up value [${value}] for value expression for item [${ctx.currentItemPath()}]`)
  }
  ctx.parseContext.flattenedTree[ctx.currentItemPath()] = value;

  return value;
}

function doEval(item, ctx) {
  for(let key of Object.keys(item)) {
    const expression = getExpressionByName(key);
    if (expression !== null) {
      console.log('found expression:' + expression.keyword);
      console.log(expression.evalFunction(ctx));
    }
  }
}
function evalProcessEnvExpression(ctx) {
  let value = ctx.item['$process.env'];

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length !== 1) {
      throw new Error('evalProcessEnvExpression expects a string or an object with 1 key', ctx);
    }
    if (ctx.expression.debug === true) {
      console.log(`key [${keys[0]}] value [${value[keys[0]]}]`);
    }

    let expression = getExpressionByName(keys[0]);
    if (!expression) {
      throw new Error(`evalProcessEnvExpression with an object child has an unrecognized keyword [${keys[0]}]`, ctx);
    }

    let pushCtxItem = ctx.item;
    ctx.item = value;
    if (ctx.expression.debug === true) {
      console.log(value);
    }
    value = expression.evalFunction(ctx);
    ctx.item = pushCtxItem;
    //throw new Error('evalProcessEnvExpression with an object child is not yet supported', ctx);
  }

  if( typeof value === 'object' ) {
    if (ctx.expression.debug === true) {
      console.log('child is a object so expanding. before:' + JSON.stringify(value));
    }
    doEval(value, ctx);
    if (ctx.expression.debug === true) {
      console.log('after:' + JSON.stringify(value));
    }

  }
  const newValue = process.env[value];

  // update the flattenedTree

  if (ctx.expression.debug === true) {
    console.log('evalProcessEnvExpression:ft updated:' + ctx.currentItemPath());
    console.log('evalProcessEnvExpression:ft updated:' + newValue);
  }

  ctx.parseContext.flattenedTree[ctx.currentItemPath()] = newValue;

  return newValue;
}

const expressions = [
  { keyword: '$value', evalFunction: evalValueExpression, pass: 2, debug: false },
  { keyword: '$process.env', evalFunction: evalProcessEnvExpression, pass: 1, debug: false },
  { keyword: '$concat', evalFunction: evalConcatExpression, pass: 3  },
  { keyword: '$function', evalFunction: evalFunctionExpression, pass: 4, debug: false  },

];

function getExpressionByName(name) {
  for(let expression of expressions) {
    if (expression.keyword === name) {
      return expression;
    }
  }
  return null;
}

function getExpression(item) {
  for(let expression of expressions) {
    if (item[expression.keyword]) {
      return expression;
    }
  }
  return null;
}

function walkChildItems(parent, items, depth, context, parseContext) {

  if (debug.depth) {
    console.log(`walkChildItem depth: ${depth}, ${context}, pass [${parseContext.pass}] {`);
  }
  //console.log(`context [${context}] depth [${depth}]`);
  //console.log(items);

  for(let item in items) {
    let itemKey = null;
    // first pass, save the path to the item in JSON into our flatterned tree with it's key
    if (depth === 0) {
      itemKey = context + item;
    } else {
      itemKey = context + '.' + item;
    }

    // if the item is an object, see if the first child is an known expression like $concat
    if (typeof items[item] === 'object') {
      if (debug.depth) {
        console.log(`processing Object.  item [${item}], items[item] = [${JSON.stringify(items[item])}]`);
      }
      const expression = getExpression(items[item]);
      if (expression !== null) {
        if (debug.depth) {
          console.log(`expression found [${expression.keyword}] for item [${itemKey}]`);
        }

        if (parseContext.pass < expression.pass) {
          //console.log('expression pass not ready yet');
          continue;
        }
        const ctx = {
          itemPath: context,
          item: items[item],
          currentItemName: item,
          currentItemPath: () => {
            if (depth === 0 ) {
              return context + item;
            } else {
              return context + '.' + item
            }
          },
          depth,
          parent,
          parseContext,
          expression,
          items,
          debug: globalDebugEnabled,
          walkChildItems,
        };

        const evalResult = expression.evalFunction(ctx);
        items[item] = evalResult;
        parseContext.flattenedTree[itemKey] = evalResult;
        continue;
      }

      if (depth === 0) {
        walkChildItems(items, items[item], depth + 1, context + item, parseContext);
      } else {
        walkChildItems(items, items[item], depth + 1, context + '.' + item, parseContext);
      }
    } else {

      if (debug.depth) {
        console.log(`depth [${depth}: processing value, item [${itemKey}]`);
      }

      parseContext.flattenedTree[itemKey] = items[item];

    }
  }
  if (debug.depth) {
    console.log(`} walkChildItem depth: ${depth}, ${context}`);
    console.log(' ');
  }

}

function parse(json, callerOptions) {
  const options = callerOptions || {};

  // clone the input json so we don't modify it
  results = JSON.parse(JSON.stringify(json));

  const rootItem = ast.newContainer('root');
  // init the parser context
  const parseContext = {
    pass:0,
    flattenedTree: {},
    options
  };

  // build the flattenedTree (the global variable list for the JSON file)
  walkChildItems(null, results, 0, '$', parseContext);
  parseContext.pass = 1;
  walkChildItems(null, results, 0, '$', parseContext);
  parseContext.pass = 2;
  walkChildItems(null, results, 0, '$', parseContext);
  parseContext.pass = 3;
  walkChildItems(null, results, 0, '$', parseContext);
  parseContext.pass = 4;
  walkChildItems(null, results, 0, '$', parseContext);

  if (callerOptions.results) {
    callerOptions.results.global = {};
    callerOptions.results.global.flattenedTree = parseContext.flattenedTree;
  }

  return results;
}
module.exports = (json, options) => {
  return parse(json, options);
};
