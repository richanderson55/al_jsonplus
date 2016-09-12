module.exports.item = require('./item');
module.exports.func = require('./func');
module.exports.container = require('./container');

module.exports.newItem = function(name, value) {
  return new module.exports.item(name, value);
}

module.exports.newFunc= function(name, value) {
  return new module.exports.func(name, value);
}
module.exports.newContainer= function(name) {
  return new module.exports.container(name);
}

module.exports.jsonLoader = require('./jsonLoader');
