'use strict';
const expect = require('chai').expect;
const ast = require('../../../ast');

const hello = {
  "name": "richard",
  "age": "44",
  "address": {
    "line1": "11 nice way",
    "state": "WA"
  },
  "favfood": ['ice cream', 'pizza'],
  "places": [ {'name': 'London Bridge', 'rank': '1'}, {'name': 'Times Square', 'rank': '2'}],

  "morePlaces": [ ['New York', 'Chicago'], ['London', 'Wales']],

}

describe('basic test of the visit function', () => {
  it('visit all nodes and get expected count', function () {
    const options = {};

    let itemCount = 0;
    let itemArray = [];
    let objectCount = 0;
    let objectArray = [];
    let containerCount = 0;
    let countainerArray = [];
    let arrayCount = 0;
    let arrayArray = [];
    let arrayItems = 0;
    let arrayItemArray = [];
    let tree = null;
    let onIndexCreatedCalled = false;

    const onNode = function(node) {

      if (node.isObject) {
        objectArray[objectCount] = node;
        objectCount++;
      }
      //console.log(node.id);
      //console.log(node.type);
      //console.log(node.isArray);
      //node.dumpConsole();
      if (node.isArray === true) {
        arrayArray[arrayCount] = node;
        arrayCount++;
      } else if (node.isContainer === true) {
        countainerArray[containerCount] = node;
        containerCount++;
      } else {
        if (node.parent && node.parent.isArray) {
          arrayItemArray[arrayItems] = node;
          arrayItems++;
        } else {
          itemArray[itemCount] = node;
          itemCount++;
        //  console.log('added to itemArray');
        }
      }
    }

    options.onIndexCreated = function(root, index) {
      onIndexCreatedCalled = true;
      tree = root;
      ast.visitNodes(tree, onNode);
    }

    const json = ast.load(hello, options);
    expect(onIndexCreatedCalled).to.equal(true);
    expect(itemCount).to.equal(8);
    expect(containerCount).to.equal(3);
    expect(arrayCount).to.equal(5);
    expect(arrayItems).to.equal(6);
    expect(objectCount).to.equal(3);

    for(let item of objectArray) {
      console.log(item.id);
    }
  });

  it('visit item nodes with a container only filter and get expected count', function () {
    const options = {};
    let itemCount = 0;
    let containerCount = 0;
    let tree = null;
    let onIndexCreatedCalled = false;

    const onNode = function(node) {
      if (node.isContainer === true) {
        containerCount++;
      } else {
        itemCount++;
      }
    }

    const filter = function(node) {
      if (node.isContainer === true) { // filter objects & arrays
        return true;
      }
      return false;
    }

    options.onIndexCreated = function(root, index) {
      onIndexCreatedCalled = true;
      tree = root;
      ast.visitNodes(tree, onNode, filter);
    }

    const json = ast.load(hello, options);
    expect(onIndexCreatedCalled).to.equal(true);
    expect(itemCount).to.equal(0);
    expect(containerCount).to.equal(8);
  });

});
