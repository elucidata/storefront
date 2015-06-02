"use strict";

exports.__esModule = true;
exports["default"] = merge;

function merge(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
  });

  return target;
}

module.exports = exports["default"];