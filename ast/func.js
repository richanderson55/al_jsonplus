'use strict';

const item = require('./item');

class func extends item {
  constructor(name, value) {
    super(name, value);
    this._type = "func";
  }

  get func() {
    return this._func;
  }
  set func(value) {
    this._func = value;
  }

  set value(value) {
    this._value = value;
  }
  get value() {
    return this._value();
  }
}

module.exports = func;
