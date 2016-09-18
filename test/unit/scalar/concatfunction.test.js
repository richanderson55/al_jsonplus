'use strict';
const expect = require('chai').expect;
const jsonplus = require('../../../ast');

describe('concat function tests - @concat', () => {
  it('basic concat from a string array', function () {
    const simple = {
      "hello": {"$concat": ["a", "b", "c"]}
    }

    const tree = jsonplus.load(simple);

    expect(Object.keys(tree).length).to.equal(1);
    expect(tree.hello).to.equal("abc");
  });

  it('basic concat from other top level values', function () {
    const simple = {
      "hello": {"$concat": ["$value1", "$value2", "$value3"]},
      "value1": "a",
      "value2": "b",
      "value3": "c",
    }

    const tree = jsonplus.load(simple);

    //console.log(tree);
    expect(Object.keys(tree).length).to.equal(4);
    expect(tree.hello).to.equal("abc");
  });

  it('basic concat from other top level values', function () {
    const simple = {
      "hello": {"$concat": ["$value1", "$object2.value2", "$object3.value3"]},
      "value1": "a",
      "object2": {
        "value2": "b"
      },
      "object3": {
        "value3": "c",
        "concat": { "$concat": ["$object2.value2", "$object3.value3"] }
      }
    }

    const tree = jsonplus.load(simple);
    expect(Object.keys(tree).length).to.equal(4);
    expect(tree.hello).to.equal("abc");
    expect(tree.object3.concat).to.equal("bc");
  });

});
