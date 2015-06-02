// Based on: https://github.com/paulmillr/console-polyfill/blob/master/index.js
'use strict';

module.exports = (function (con) {
  var prop,
      method,
      empty = {},
      dummy = function dummy() {},
      properties = ['memory'],
      methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profiles', 'profileEnd', 'show', 'table', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'];

  while (prop = properties.pop()) {
    // jshint ignore:line
    if (!(prop in con)) {
      con[prop] = con[prop] || empty;
    }
  }

  while (method = methods.pop()) {
    // jshint ignore:line
    if (!(prop in con)) {
      con[method] = con[method] || dummy;
    }
  }

  if (!global.console) {
    global.console = con;
  }

  return con;
})(global.console || {});