
'use strict';

const ast = require('../ast');

// basic visitor pattern with filter
module.exports.visitNodes = function (item, visitNode, filter) {
  if (!filter) {
    filter = function() { return true };
  };

  for(let subItem of item.items) {
    if (subItem.isContainer) {
      if (filter(subItem)) {
        visitNode(subItem);
      }
      module.exports.visitNodes(subItem, visitNode, filter);
    } else {
      if (!subItem.id) {
        throw new Error('id missing');
      }
      if (filter(subItem)) {
        visitNode(subItem);
      }
    }
  }
}

// build id index for the tree
module.exports.buildGlobalIdIndex = function (item, index) {
  module.exports.visitNodes(item,
    (node) => {
      index[node.id] = node;
    });
}

// walk the tree and add pointers for linkItems
module.exports.buildExecutionOrder = function(item, index) {
  const marked = {};
  const stack = [];

  // mark all items as unmarked
  for(let indexItem in index) {
    marked[indexItem] = false;
  }

  // walk and find all the value references
  buildExecutionOrderRecurse(item, index, marked, stack);

  // loop all item not touched
  for(let indexItem in index) {
    if( marked[indexItem] === false ) {
//      console.log(`item not marked ${indexItem}`);
    } else {
//      console.log(`item marked ${indexItem}`);

    }
  }

  return stack;
}

function buildExecutionOrderRecurse(item, index, marked, stack) {
  if (marked[item.id] === true ) {
    return;
  }

  marked[item.id] = true;
  for(let subItem of item.items) {
    if (subItem.isContainer) {
      buildExecutionOrderRecurse(subItem, index, marked, stack);
     } else {
      if (subItem.value[0] === '$') {
        buildExecutionOrderRecurse(index[subItem.value], index, marked, stack);
        stack.push(subItem);
      }
    }
  }
}

function buildExecutionOrderRecurseProcessEnv(item, index, marked, stack) {
  if (marked[item.id] === true ) {
    return;
  }
  marked[item.id] = true;

  for(let subItem of item.items) {
    if (subItem.isContainer) {
      buildExecutionOrderRecurseProcessEnv(subItem, index);
    } else {
      // value reference
      if (subItem.name === "$process.env" || subItem.name === "$env") {
        stack.push(subItem);
      }
    }
  }
}


// walk the tree and add pointers for linkItems
module.exports.exec = function(stack, index) {
  //console.log(`exec called - stack size [${stack.length}]`);

  for(let stackItem of stack) {
    execItem(stackItem, index);
  }
}

function execItem(item, index) {
  //console.log(`exec [${item.name}]`);

  if (item.isContainer) {
    for(let childItem of item.items) {
      execItem(childItem, index);
    }
  } else
  if (item.name === "$value") {
      expandValueReference(item, index);
  } else if (item.name === "$process.env" || item.item === "$env") {
      expandEnvReference(item, index);
  } else if (item.parent.type === ast.NodeTypes.ARRAY) { // array entry?
      module.exports.expandValueReferences(item, index);
  } else {
    item.dumpConsole();
    throw new Error(`function [${item.name}] not supported`);

  }
}

function expandValueReference(item, index) {
  let indexEntry = index[item.value]
  if (!indexEntry) {
    throw new Error(`entry [${item.value}] not found in idIndex`);
  }

  // make sure any child functions are processed first

  const debug = false;
  if(debug) {
    console.log(`expanding value for node [${item.id}]`);
    console.log(`value for node [${item.value}]`);
    console.log(`referenced node id [${indexEntry.id}]`);
    console.log(`referenced node value [${indexEntry.value}]`);
    console.log(`referenced node type [${indexEntry.type}]`);
    indexEntry.dumpConsole();
  }

  if (indexEntry.type === ast.NodeTypes.ITEM) {
    // create a new item
    const newItem = ast.newItem(item.parent.name, indexEntry.value);
    item.parent.parent.replaceItem(item.parent, newItem);
  } else if (indexEntry.isContainer) {
      execItem(indexEntry, index); // expand any child container
      indexEntry = index[item.value];
      const newItem = ast.newItem(item.parent.name, indexEntry.value);
      item.parent.parent.replaceItem(item.parent, newItem);
  }
}

module.exports.expandValueReferences = function(item, index) {
  module.exports.visitNodes(item,
    (node) => {
      expandValueReference(node, index);
    },
    (node) => {
      if (node.isContainer === true) {
        return false;
      }
      if (node.name !== "$value") {
        return false;
      }
      return true;
    });
}

function expandEnvReference(item, index) {
  //console.log(item.name);
  const envValue = process.env[item.value]
  if (!envValue) {
    throw new Error(`env variable [${envValue}] not found`);
  }
  if (item.parent === null) {
    throw new Error(`expected parent for item`);
  }

  const newItem = ast.newItem(item.parent.name, envValue);
  item.parent.parent.replaceItem(item.parent, newItem);
  index[newItem.id] = newItem; // update the index
}

module.exports.expandEnvReferences = function(item, index) {
  module.exports.visitNodes(item,
    (node) => {
      //console.log(`expanding env reference for ${node.id}`);
      expandEnvReference(node, index);
    },
    (node) => {
      if (node.isContainer === true) {
        return false;
      }
      if (node.name !== "$process.env" && node.name !== "$env") {
        return false;
      }
      return true;
    });
}

module.exports.expandConcat = function (item, index) {
  for(let subItem of item.items) {
    if (subItem.isContainer) {
      if ( subItem.name !== '$concat') {
        module.exports.expandConcat(subItem, index);
      } else {
        let concatValue = '';
        for(let arrayItem of subItem.items) {
          if (arrayItem.value[0] === '$') {
            concatValue = concatValue + index[arrayItem.value].value;

          } else {
            concatValue = concatValue + arrayItem.value;
          }
        }

        const newItem = ast.newItem(subItem.parent.name, concatValue);
        subItem.parent.parent.replaceItem(subItem.parent, newItem);
        index[newItem.id] = newItem; // update the index
      }
    }
  }
}

module.exports.runFunctions = function (item, index, stdFunctions) {
  for(let subItem of item.items) {
    if (subItem.isContainer) {
        module.exports.runFunctions(subItem, index, stdFunctions);
    } else {
      if (subItem.name === "$function" || subItem.name === "$func") {
        const funcname = subItem.value;
        if (!funcname) {
          throw new Error(`function name [${funcname}] not found`);
        }
        const args = subItem.parent.getByName('args');
        const newItem = ast.newItem(subItem.parent.name, stdFunctions[funcname](args));
        subItem.parent.parent.replaceItem(subItem.parent, newItem);
        index[newItem.id] = newItem; // update the index
//        console.log(`runing function [${funcname}]`)
      }
    }
  }
}

module.exports.serializeTreeToJsonObject = function (item, destination) {
  //console.log(`serializeTreeToJsonObject: [${item.name}], type [${item.type}]`);

  if (item.type === ast.NodeTypes.ARRAY) {

    for(let subItem of item.items) {
      //console.log(`subItem: [${subItem.name}]`);
      if (subItem.type === ast.NodeTypes.CONTAINER) {
        let o = {};
        module.exports.serializeTreeToJsonObject(subItem, o);
        destination.push(o);
      } else if (subItem.type === ast.NodeTypes.ITEM) {
        let o = {};
        o[subItem.name] = subItem.value;
        destination.push(o);
      } else if (subItem.type === ast.NodeTypes.ARRAY) {
        let o = [];
        module.exports.serializeTreeToJsonObject(subItem, o);
        destination.push(o);
      } else {
        throw new Error(`type not supported ${subItem.type}`);
      }
    }
    return;
  }

  for(let subItem of item.items) {
//    console.log(`subItem: [${subItem.name}]`);
    if (subItem.type === ast.NodeTypes.CONTAINER) {
      destination[subItem.name] = {};
      module.exports.serializeTreeToJsonObject(subItem, destination[subItem.name]);
    } else if (subItem.type === ast.NodeTypes.ITEM) {
      destination[subItem.name] = subItem.value;
    } else if (subItem.type === ast.NodeTypes.ARRAY) {
      destination[subItem.name] = [];
      module.exports.serializeTreeToJsonObject(subItem, destination[subItem.name]);
    } else {
      throw new Error(`type not supported ${subItem.type}`);
    }
  }
}
