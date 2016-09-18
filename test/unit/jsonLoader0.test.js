'use strict';
const expect = require('chai').expect;
const parser = require('../../parser');
const ast = require('../../ast');

describe('concat function tests', () => {

  const rootItem = ast.newContainer('root');
  rootItem.push(ast.newItem('hello', 'world'));
  rootItem.push(ast.newItem('how', 'are'));
  rootItem.push(ast.newItem('you', 'doing'));
  rootItem.push(ast.newFunc('amazing', function() { return 'grace' }));

  const childContainer = ast.newContainer('child1');
  childContainer.push(ast.newItem('hello', 'world'));
  childContainer.push(ast.newItem('how', 'are'));
  childContainer.push(ast.newItem('you', 'doing'));
  childContainer.push(ast.newFunc('amazing', function() { return 'grace' }));

  rootItem.push(childContainer);
  it('basic concat from a string array', function () {
  });

});
