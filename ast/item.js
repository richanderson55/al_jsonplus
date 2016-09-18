'use strict';

const types = require('./types')

// simple type of hold a named value pair
class item {

  constructor(name, value, type) {
    this.name = name;
    this.value = value;
    this._type = type || types.ITEM;
    this._items = [];
    this._parent = null;
    //console.log(`new item [${this.name}]`);

    // determines if the functions/expand of the node have been executed
    this.inEdges = [];
    this.outEdges = [];
  }

  get isFunction() {
    if ( this.name[0] === '$') {
      return true;
    }

    return false;
  }

  get isContainer() {
    return false;
  }
  get isObject() {
    return false;
  }
  get isArray() {
    return false;
  }

  dumpConsole(depth) {
    const currentDepth = depth || 0;
    console.log(`item dump for node id [${this.id}]`);
    console.log(` name: [${this.name}]`);
    console.log(` type: [${this.type}]`);
    console.log(` value: [${this.value}]`);
    console.log(` isFunction: ${this.isFunction}`);
    if ( this.type === types.CONTAINER) {
      console.log(`  child items ${this.items.length}`);
      for(let childItem of this.items) {
        childItem.dumpConsole();
      }
    }
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
        newItem.id = oldItem.id; // adopt the id
        return;
      }
      index++;
    }
  }

  getByName(name) {
    for(const item of this._items) {
      if (item.name === name) {
        return item;
      }
    }

    return null;
  }

  push(item) {
    this._items.push(item);
  }
}

module.exports = item;
