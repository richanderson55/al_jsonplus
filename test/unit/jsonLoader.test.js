'use strict';
const expect = require('chai').expect;
const ast = require('../../ast');

const basicFunctions = require('../../ast/basicFunctions');

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

describe('basic test of the loader - @jsonloader', () => {
  it('ensure the root is a container and named as expected', function () {
    const myHello = ast.jsonLoader(hello);
    expect(myHello.id).to.equal('root');
    expect(myHello.type).to.equal(ast.types.NodeTypes.CONTAINER);
  });

});
