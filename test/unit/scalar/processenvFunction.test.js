'use strict';
const expect = require('chai').expect;

const parser = require('../../../parser');
const prettyjson = require('prettyjson');

process.env.TEST_A = 'hello';
process.env.TEST_B = 'world';

describe('process.env function tests', () => {
  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": "world",
      "hello2": {"$process.env": "TEST_A"}
    }

    const options = { results: {}};
    const results = parser(simple, options);
//    console.log(results);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.hello2).to.equal(process.env.TEST_A);
  });

  it('basic lookup a value from inside a level 1 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "hello2": {"$process.env": "TEST_A"}
      }
    }

    const options = { results: {}};
    const results = parser(simple, options);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.object.hello2).to.equal(process.env.TEST_A);
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

    const options = { results: {}};
    const results = parser(simple, options);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.object.object2.hello2).to.equal(process.env.TEST_A);
  });

});
