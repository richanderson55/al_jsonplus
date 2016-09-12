'use strict';
const expect = require('chai').expect;

const parser = require('../../../parser');
const prettyjson = require('prettyjson');

process.env.TEST_A = 'magic';
process.env.TEST_B = 'happens';

describe('mixed function tests', () => {
  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": {"$value": "$hello2"},
      "hello2": {"$process.env": "TEST_A"}
    }

    const options = { results: {}};
    const results = parser(simple, options);

//    console.log(results);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(2);
    expect(results.hello2).to.equal(process.env.TEST_A);
    expect(results.hello).to.equal(results.hello2);
    expect(results.hello).to.equal(process.env.TEST_A);
  });

  it('set a user name option by looking up user from an env variable, with the env name being looked up from a $value', function () {
    const simple = {
      "variables": {
        "env1": "TEST_A",
        "username_env_variable": "USER"
      },
      "options": {
        "username": {"$process.env": {"$value": "$variables.username_env_variable"}}
      },
      "hello": {"$value": "$hello2"},
      "hello2": {
        "$process.env": {
          "$value": "$variables.env1"
        }
      }
    }

    const options = { results: {}};
    const results = parser(simple, options);

    //console.log(results);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(5);
    expect(results.hello2).to.equal(process.env.TEST_A);
    expect(results.hello).to.equal(results.hello2);
    expect(results.hello).to.equal(process.env.TEST_A);

  });

  it('set a user name option by looking up user from an env variable, with the env name being looked up from a $value', function () {
    const simple = {
      "variables": {
        "env1": "TEST_A",
        "username_env_variable": "USER"
      },
      "options": {
        "username": {"$process.env": {"$value": "$variables.username_env_variable"}}
      },
      "hello": {"$value": "$hello2"},
      "hello2": {
        "$process.env": {
          "$value": "$variables.env1"
        }
      },
      "concat": { "$concat": ["$variables.username_env_variable", "$options.username"]}
    }

    const options = { results: {}};
    const results = parser(simple, options);

    //console.log(results);
    expect(options.results.global).to.not.equal(null);
    expect(Object.keys(options.results.global.flattenedTree).length).to.equal(6);
    expect(results.hello2).to.equal(process.env.TEST_A);
    expect(results.hello).to.equal(results.hello2);
    expect(results.hello).to.equal(process.env.TEST_A);

    expect(results.concat).to.equal(results.variables.username_env_variable +
      results.options.username);

  });

});
