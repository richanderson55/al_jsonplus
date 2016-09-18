'use strict';

const ast = require('./ast');
const prettyjson = require('prettyjson');
const rootItem = ast.newContainer('root');
const basicFunctions = require('./ast/basicFunctions');
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
basicFunctions.serializeTreeToJsonObject(rootItem, newObject);


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
  "cloneEnv": { "$value": "$variables.env.username"},
  "func": { "$func": "hello"},
  "now": { "$func": "now"}
}

const myHello = ast.jsonLoader(hello);
const myHelloRebuilt = {};

// build an id index to all of the items
const idIndex = {};
basicFunctions.buildGlobalIdIndex(myHello, idIndex);
basicFunctions.expandValueReferences(myHello, idIndex);
basicFunctions.expandEnvReferences(myHello);

const stdFunctions = {
  "hello": function() { return "hello world"},
  "now": function() { return new Date() }
}
basicFunctions.runFunctions(myHello, stdFunctions);
basicFunctions.serializeTreeToJsonObject(myHello, myHelloRebuilt);

console.log(myHelloRebuilt);
