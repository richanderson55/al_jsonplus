'use strict';
const expect = require('chai').expect;
const parser = require('../../../parser');

describe('concat function tests', () => {

  function echoArgs(args) {
    if (!args) {
      throw new Error('echoArgs expected args');
    }
    return args;
  }

  it('call a custom function', function () {
    const simple = {
      "field1": {"$function": "echoArgs",
                "args": "7"},
      "field2": {"$function": "echoArgs",
                  "args": "8"}
    }

    const options = { results: {}}; // by including results we get the output from the parser
    options.functions = {};
    options.functions.echoArgs = echoArgs;
    const results = parser(simple, options);

    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.field1).to.equal("7");
    expect(results.field2).to.equal("8");
  });

  function echoArgs2(args) {
    if (!args) {
      throw new Error('echoArgs expected args');
    }
    return args;
  }

  it('basic concat from other top level values', function () {
    const simple = {
      "hello": "world",
      "field": { "$function": "echoArgs2",
                 "args": {
                   "a": { "$value": "$hello" },
                   "b": "2"
                 }
               }
    }

    const options = { results: {}}; // by including results we get the output from the parser
    options.functions = {};
    options.functions.echoArgs2 = echoArgs2;
    const results = parser(simple, options);

    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
//    expect(results.field1).to.equal("7");
//    expect(results.field2).to.equal("8");

    console.log(results);
  });

});
