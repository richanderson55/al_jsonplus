'use strict';
const expect = require('chai').expect;
const jsonplus = require('../../../ast');

describe('value function tests', () => {
  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": "world",
      "hello2": {"$value": "$hello"}
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.hello2).to.equal(tree.hello);
  });

  it('basic lookup a value from inside a level 1 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "hello2": {"$value": "$hello"}
      }
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.object.hello2).to.equal(simple.hello);
    expect(tree.object.hello2).to.equal(tree.hello);

  });

  it('basic lookup a value from inside a level 2 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "object2": {
          "hello2": {"$value": "$hello"}
        }
      }
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.object.object2.hello2).to.equal(simple.hello);
  });

  it('set a value in the root of an object from a level 2 object', function () {
    const simple = {
      "hello": { "$value": "$object.object2.world" },
      "object": {
        "object2": {
          "world": "world"
        }
      }
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.hello).to.equal(simple.object.object2.world);
    expect(tree.hello).to.equal(tree.object.object2.world);
  });

});
