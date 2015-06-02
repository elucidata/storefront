"use strict";

exports.__esModule = true;
exports["default"] = alias;

function alias(target, prop) {
  for (var _len = arguments.length, aliases = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    aliases[_key - 2] = arguments[_key];
  }

  var item = target[prop];

  aliases.forEach(function (alias) {
    target[alias] = item;
  });
}

module.exports = exports["default"];