'use strict';
const basicFunctions = require('./basicFunctions');
module.exports.item = require('./item');
module.exports.container = require('./container');
module.exports.array = require('./array');


module.exports.newItem = function(name, value) {
  return new module.exports.item(name, value);
}

module.exports.newArray = function(name) {
  return new module.exports.array(name);
}

module.exports.newContainer= function(name) {
  return new module.exports.container(name);
}

module.exports.NodeTypes = require('./types');

module.exports.visitNodes = function(tree, onNode, filter) {
  basicFunctions.visitNodes(tree, onNode, filter);
}

module.exports.load = function(json, options) {

  const optionsForLoader = options || {};

  // load the json into a tree`
  const tree = module.exports.jsonLoader(json);
  const idIndex = {};

  // expand the tree
  basicFunctions.buildGlobalIdIndex(tree, idIndex);
  if (optionsForLoader.onIndexCreated) {
    optionsForLoader.onIndexCreated(tree, idIndex);
  }

  // get a stack of values
  const stack = basicFunctions.buildExecutionOrder(tree, idIndex);
  basicFunctions.exec(stack, idIndex);

  basicFunctions.expandValueReferences(tree, idIndex);

  basicFunctions.expandEnvReferences(tree, idIndex);
  basicFunctions.expandConcat(tree, idIndex);

  if (optionsForLoader.functions) {
    basicFunctions.runFunctions(tree, idIndex, optionsForLoader.functions);
  }

  if (optionsForLoader.onTreeCreated) {
    optionsForLoader.onTreeCreated(tree, idIndex);
  }
  const newJson = {};
  basicFunctions.serializeTreeToJsonObject(tree, newJson);

  // save back to json
  return newJson;
}

module.exports.loadOld = function(json, options) {

  const optionsForLoader = options || {};

  // load the json into a tree`
  const tree = module.exports.jsonLoader(json);
  const idIndex = {};

  // expand the tree
  basicFunctions.buildGlobalIdIndex(tree, idIndex);
  basicFunctions.buildExecutionOrder(tree, idIndex);
  basicFunctions.expandValueReferences(tree, idIndex);
  basicFunctions.expandEnvReferences(tree, idIndex);
  basicFunctions.expandConcat(tree, idIndex);

  if (optionsForLoader.functions) {
    basicFunctions.runFunctions(tree, idIndex, optionsForLoader.functions);
  }

  const newJson = {};
  basicFunctions.serializeTreeToJsonObject(tree, newJson);

  // save back to json
  return newJson;
}
module.exports.jsonLoader = require('./jsonLoader');
