'use strict';
const expect = require('chai').expect;
const parser = require('../../../parser');

describe('concat function tests', () => {
  it('basic concat from a string array', function () {
    const simple = {
      "hello": {"$concat": ["a", "b", "c"]}
    }

    const options = { results: {}}; // by include results we get the output from the parser
    const results = parser(simple, options);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(1);
    expect(results.hello).to.equal("abc");
  });

  it('basic concat from other top level values', function () {
    const simple = {
      "hello": {"$concat": ["$value1", "$value2", "$value3"]},
      "value1": "a",
      "value2": "b",
      "value3": "c",
    }

    const options = { results: {}}; // by include results we get the output from the parser
    const results = parser(simple, options);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(4);
    expect(results.hello).to.equal("abc");
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

    const options = { results: {}}; // by include results we get the output from the parser
    const results = parser(simple, options);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(5);
    expect(results.hello).to.equal("abc");
    expect(results.object3.concat).to.equal("bc");
  });

});
