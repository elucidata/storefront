"use strict";

exports.__esModule = true;
exports["default"] = flatten;

function flatten(arrays) {
  var merged = [];

  return merged.concat.apply(merged, arrays);
}

module.exports = exports["default"];