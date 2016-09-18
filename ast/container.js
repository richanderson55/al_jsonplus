'use strict';

const item = require('./item');
const types = require('./types')

class container extends item {
  constructor(name) {
    super(name);
    this._type = types.CONTAINER;
  }

  get isContainer() {
    return true;
  }

  set value(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }

  getByKey(key) {
    for(let item in this._items) {
      if (this._items[item].name === key) {
        return this._items[item];
      }
    }
    return null;
  }
}

module.exports = container;
