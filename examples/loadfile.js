'use strict';

const jsonplus = require('../ast');
const simple = require('./names.json');
const names = jsonplus.load(simple);

console.log(JSON.stringify(names));
