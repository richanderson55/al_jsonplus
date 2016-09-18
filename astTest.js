'use strict';

const ast = require('./ast');
const basicFunctions = require('./ast/basicFunctions');

const rootItem = ast.newContainer('root');
rootItem.push(ast.newItem('name', 'richard'));
rootItem.push(ast.newItem('age', '21'));


const address = ast.newContainer('home address');
rootItem.push(address);
address.push(ast.newItem('line1', '136 lookout rd'));

const childContainer = ast.newContainer('work address');
rootItem.push(childContainer);
childContainer.push(ast.newItem('line 1', '71 hanover rd'));

const array = ast.newArray('parent');
rootItem.push(array);


const subarray1 = ast.newArray('one');
array.push(subarray1);
subarray1.push(ast.newItem('line1', 'value1'));
subarray1.push(ast.newItem('line2', 'value 2'));
subarray1.push(ast.newItem('line3', 'value 3'));

array.push(ast.newItem('line1', '136 lookout rd'));

const subarray2 = ast.newArray('two');
array.push(subarray2);
subarray2.push(ast.newItem('subline1', 'value1'));
subarray2.push(ast.newItem('subline2', 'value 2'));
subarray2.push(ast.newItem('subline3', 'value 3'));

const newObject = {};
basicFunctions.serializeTreeToJsonObject(rootItem, newObject);

console.log(newObject);

console.log(JSON.stringify(newObject));
