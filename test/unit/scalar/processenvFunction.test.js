'use strict';
const expect = require('chai').expect;
const jsonplus = require('../../../ast');

process.env.TEST_A = 'hello';
process.env.TEST_B = 'world';

describe('process.env function tests', () => {
  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": "world",
      "hello2": {"$process.env": "TEST_A"}
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(tree.hello2).to.equal(process.env.TEST_A);
  });

  it('basic lookup a value from inside a level 1 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "hello2": {"$process.env": "TEST_A"}
      }
    }

    const tree = jsonplus.load(simple);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.object.hello2).to.equal(process.env.TEST_A);
  });

  it('basic lookup a value from inside a level 2 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "object2": {
          "hello2": {"$process.env": "TEST_A"}
        }
      }
    }

    const tree = jsonplus.load(simple);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.object.object2.hello2).to.equal(process.env.TEST_A);
  });

});
