'use strict';
const expect = require('chai').expect;
const ast = require('../../ast');

const basicFunctions = require('../../ast/basicFunctions');

const hello = {
  "name": "richard",
  "age": "43",
  "address": {
    "line1": "136 lookout rd"
  }
}

describe('basic test of the visit function', () => {
  it('visit all nodes and get expected count', function () {
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

    options.onIndexCreated = function(root, index) {
      onIndexCreatedCalled = true;
      tree = root;
      ast.visitNodes(tree, onNode);
    }

    const json = ast.load(hello, options);
    expect(onIndexCreatedCalled).to.equal(true);
    expect(itemCount).to.equal(3);
    expect(containerCount).to.equal(1);
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
      if (node.isContainer === true) {
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
    expect(containerCount).to.equal(1);
  });

});
