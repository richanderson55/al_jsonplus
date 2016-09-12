'use strict';

// simple type of hold a named value pair
class item {

  constructor(name, value) {
    this.name = name;
    this.value = value;
    this._type = "item";
    this._items = [];
    this._parent = null;
  }

  get parent() {
    return this._parent;
  }
  set parent(value) {
    this._parent = value;
  }
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }

  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
  }

  get items() {
    return this._items;
  }

  get type() {
    return this._type;
  }

  replaceItem(oldItem, newItem) {
    let index = 0;
    for(let item of this._items) {
      if (item === oldItem) {
        this._items[index] = newItem;
        newItem.parent = this;
        return;
      }
      index++;
    }
  }

  push(item) {
    this._items.push(item);
  }

}

module.exports = item;
