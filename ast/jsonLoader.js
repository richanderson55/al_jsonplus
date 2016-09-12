'use strict';

const ast = require('./index');

const debug = {depth: false};

module.exports = function(json) {
  const rootItem = ast.newContainer('root');
  rootItem.id = 'root';
  walkChildItems(rootItem, json, 0, '$');
  return rootItem;
}


function walkChildItems(item, object, depth, context) {

  for(let key in object) {
    let itemKey = null;
    if (depth === 0) {
      itemKey = context + key;
    } else {
      itemKey = context + '.' + key;
    }

    // if the item is an object, see if the first child is an known expression like $concat
    if (typeof object[key] === 'object') {
      if (debug.depth) {
        console.log(`processing Object.  item [${itemKey}], object[key] = [${JSON.stringify(object[key])}]`);
      }

      const childContainer = ast.newContainer(key);
      childContainer.id = itemKey;
      childContainer.parent = item;

      walkChildItems(childContainer, object[key], depth + 1, itemKey);

      item.push(childContainer);
      continue;
    }

    if (debug.depth) {
      console.log(`depth [${depth}: processing value, key [${itemKey}] value [${object[key]}]`);
    }

    const childItem = ast.newItem(key, object[key]);
    childItem.id = itemKey;
    childItem.parent = item;
    item.push(childItem);
  }

  if (debug.depth) {
    console.log(`} walkChildItem depth: ${depth}, ${context}`);
    console.log(' ');
  }

}
