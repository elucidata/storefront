"use strict";

exports.__esModule = true;
exports["default"] = uid;
var _lastGeneratedUID = 0;

function uid() {
  var radix = arguments[0] === undefined ? 36 : arguments[0];

  var now = Math.floor(new Date().getTime() / 1000);

  while (now <= _lastGeneratedUID) {
    now += 1;
  }

  _lastGeneratedUID = now;

  return now.toString(radix);
}

module.exports = exports["default"];