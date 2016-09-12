'use strict';
const expect = require('chai').expect;

const parser = require('../../../parser');
const prettyjson = require('prettyjson');

describe('value function tests', () => {
  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": "world",
      "hello2": {"$value": "$hello"}
    }

    const options = { results: {}};
    const results = parser(simple, options);
    //console.log(results);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.hello2).to.equal(results.hello);
  });

  it('basic lookup a value from inside a level 1 object', function () {
    const simple = {
      "hello": "world",
      "object": {
        "hello2": {"$value": "$hello"}
      }
    }

    const options = { results: {}};
    const results = parser(simple, options);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.object.hello2).to.equal(results.hello);
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

    const options = { results: {}};
    const results = parser(simple, options);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.object.object2.hello2).to.equal(results.hello);
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

    const options = { results: {}};
    const results = parser(simple, options);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.hello).to.equal(results.object.object2.world);
  });

});
