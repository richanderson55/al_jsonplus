'use strict';
const expect = require('chai').expect;
const jsonplus = require('../../../ast');

describe('concat function tests', () => {

  function echoArgs(args) {
    if (!args) {
      throw new Error('echoArgs expected args');
    }
    return args.value;
  }

  it('call a custom function', function () {
    const simple = {
      "field1": {"$function": "echoArgs",
                "args": "7"},
      "field2": {"$function": "echoArgs",
                  "args": "8"}
    }


    const functions = {};
    functions.echoArgs = echoArgs;

    const options = { functions}
    const tree = jsonplus.load(simple, options);

    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.field1).to.equal("7");
    expect(tree.field2).to.equal("8");
  });

  // simple function to multiple two values
  function multiply(args) {
    if (!args) {
      throw new Error('echoArgs expected args');
    }

    let a = args.getByKey('a');
    let b = args.getByKey('b');

    return a.value * b.value;
  }

  it('basic concat from other top level values', function () {
    const simple = {
      "hello": "world",
      "field": { "$function": "multiply",
                 "args": {
                   "a": "5",
                   "b": "2"
                 }
               }
    }

    const options = { results: {}}; // by including results we get the output from the parser
    options.functions = {};
    options.functions.multiply = multiply;
    const tree = jsonplus.load(simple, options);

    expect(Object.keys(tree).length).to.equal(2);
    //console.log(tree);
    expect(tree.field).to.equal(10);
  });

});
