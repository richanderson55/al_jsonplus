'use strict';
const expect = require('chai').expect;
const jsonplus = require('../../../ast');
const prettyjson = require('prettyjson');

process.env.TEST_A = 'magic';
process.env.TEST_B = 'happens';

describe('mixed function tests', () => {

  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello2": {"$process.env": "TEST_A"}
    }

    const tree = jsonplus.load(simple);
    //console.log(tree);
  });

  it('basic lookup a value test in a flat object', function () {
    const simple = {
      "hello": {"$value": "$hello2"},
      "hello2": {"$process.env": "TEST_A"}
    }

    const tree = jsonplus.load(simple);

    // console.log(tree);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(2);
    expect(tree.hello2).to.equal(process.env.TEST_A);
    expect(tree.hello).to.equal(tree.hello2);
    expect(tree.hello).to.equal(process.env.TEST_A);
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

    const tree = jsonplus.load(simple);

    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(4);
    expect(tree.hello2).to.equal(process.env.TEST_A);
    expect(tree.hello).to.equal(tree.hello2);
    expect(tree.hello).to.equal(process.env.TEST_A);

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

    const tree = jsonplus.load(simple);

    //console.log(results);
    expect(tree).to.not.equal(null);
    expect(Object.keys(tree).length).to.equal(5);
    expect(tree.hello2).to.equal(process.env.TEST_A);
    expect(tree.hello).to.equal(tree.hello2);
    expect(tree.hello).to.equal(process.env.TEST_A);

    expect(tree.concat).to.equal(tree.variables.username_env_variable +
      tree.options.username);

  });

});
