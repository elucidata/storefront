/* global performance */
'use strict';

exports.__esModule = true;
var now = (function () {
  if (typeof performance === 'object' && performance.now) {
    return performance.now.bind(performance);
  } else if (Date.now) {
    return Date.now.bind(Date);
  } else {
    return function () {
      return new Date().getTime();
    };
  }
})();

exports['default'] = now;
module.exports = exports['default'];