'use strict';

const ast = require('./ast');
const prettyjson = require('prettyjson');


const rootItem = ast.newContainer('root');
rootItem.push(ast.newItem('hello', 'world'));
rootItem.push(ast.newItem('how', 'are'));
rootItem.push(ast.newItem('you', 'doing'));
rootItem.push(ast.newFunc('amazing', function() { return 'grace' }));

const childContainer = ast.newContainer('child1');
childContainer.push(ast.newItem('hello', 'world'));
childContainer.push(ast.newItem('how', 'are'));
childContainer.push(ast.newItem('you', 'doing'));
childContainer.push(ast.newFunc('amazing', function() { return 'grace' }));

rootItem.push(childContainer);

const newObject = {};
serializeItemToObject(rootItem, newObject);

function serializeItemToObject(item, destination) {
  for(let subItem of item.items) {
    if (subItem.type === 'container') {
      destination[subItem.name] = {};
      serializeItemToObject(subItem, destination[subItem.name]);
    } else {
      destination[subItem.name] = subItem.value;
    }
  }
}

function buildGlobalIdIndex(item, index) {
  for(let subItem of item.items) {
    if (subItem.type === 'container') {
      index[subItem.id] = subItem;
      buildGlobalIdIndex(subItem, index);
    } else {
      if (!subItem.id) {
        console.log(item);
        throw new Error('id missing');
      }
      index[subItem.id] = subItem;
    }
  }
}

function expandValueReferences(item, index) {
  for(let subItem of item.items) {
    if (subItem.type === 'container') {
      expandValueReferences(subItem, index);
    } else {
      // value reference
      if (subItem.name === "$value") {
        const indexEntry = index[subItem.value]
        if (!indexEntry) {
          throw new Error(`entry [${subItem.value}] not found in idIndex`);
        }

        if (indexEntry.type === 'item') {
          // create a new item
          const newItem = ast.newItem(subItem.parent.name, indexEntry.value);
          subItem.parent.parent.replaceItem(subItem.parent, newItem);
        } else if (indexEntry.type === 'container') {
            throw new Error(`$value references do not work in containers/objects [${subItem.id}]`);
        }
      }
    }
  }
}

function expandProcessEnvReferences(item, index) {
  for(let subItem of item.items) {
    if (subItem.type === 'container') {
      expandProcessEnvReferences(subItem, index);
    } else {
      // value reference
      if (subItem.name === "$process.env" || subItem.name === "$env") {
        const envValue = process.env[subItem.value]
        if (!envValue) {
          throw new Error(`env variable [${envValue}] not found`);
        }
        if (subItem.parent === null) {
          console.log(subItem);
          throw new Error(`expected parent for subItem`);
        }
        const newItem = ast.newItem(subItem.parent.name, envValue);
        subItem.parent.parent.replaceItem(subItem.parent, newItem);
      }
    }
  }
}
const hello = {
  "variables": {
    "env": {
      "username": "USER"
    }
  },
  "hello": "world",
  "how": "are",
  "you": "doing",
  "object1": {
    "key1_object1": "value1_object1"
  },
  "object2": {
    "key1_object2": "value1_object2"
  },
  "value": { "$value": "$hello"},
  "anotherValue": { "$value": "$object1.key1_object1"},
  "anotherValue2": { "$env": "USER"},
  "anotherValue3": { "$env": { "$value": "$variables.env.username" } },
  "cloneEnv": { "$value": "$variables.env.username"}

}

const myHello = ast.jsonLoader(hello);

const myHelloRebuilt = {};

// build an id index to all of the items
const idIndex = {};
buildGlobalIdIndex(myHello, idIndex);
expandValueReferences(myHello, idIndex);
expandProcessEnvReferences(myHello);

serializeItemToObject(myHello, myHelloRebuilt);


console.log(myHelloRebuilt);
