'use strict';

const item = require('./item');
const types = require('./types')

class array extends item {
  constructor(name) {
    super(name);
    this._type = types.ARRAY;
  }

  get isContainer() {
    return true;
  }


}

module.exports = array;
