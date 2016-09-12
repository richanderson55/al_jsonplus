'use strict';

const item = require('./item');

class container extends item {
  constructor(name) {
    super(name);
    this._type = "container";
  }

  set value(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
}

module.exports = container;
