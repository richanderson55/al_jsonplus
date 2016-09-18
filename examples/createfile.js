'use strict';

const jsonplus = require('../ast');

const rootItem = jsonplus.newContainer('root');
rootItem.push(jsonplus.newItem('name', 'richard'));
rootItem.push(jsonplus.newItem('age', '21'));

const address = jsonplus.newContainer('home address');
rootItem.push(address);
address.push(jsonplus.newItem('line1', 'jump road'));

const childContainer = jsonplus.newContainer('work address');
rootItem.push(childContainer);
childContainer.push(jsonplus.newItem('line 1', 'magic lane'));

const array = jsonplus.newArray('parent');
rootItem.push(array);


const subarray1 = jsonplus.newArray('one');
array.push(subarray1);
subarray1.push(jsonplus.newItem('line1', 'value1'));
subarray1.push(jsonplus.newItem('line2', 'value 2'));
subarray1.push(jsonplus.newItem('line3', 'value 3'));

array.push(jsonplus.newItem('line1', 'jump road'));

const subarray2 = jsonplus.newArray('two');
array.push(subarray2);
subarray2.push(jsonplus.newItem('subline1', 'value1'));
subarray2.push(jsonplus.newItem('subline2', 'value 2'));
subarray2.push(jsonplus.newItem('subline3', 'value 3'));

const newObject = {};
jsonplus.serializeTreeToJsonObject(rootItem, newObject);

console.log(JSON.stringify(newObject));
