'use strict';

exports.__esModule = true;
exports['default'] = extractMethods;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _elucidataType = require('elucidata-type');

var _elucidataType2 = _interopRequireDefault(_elucidataType);

function extractMethods(source, allowNonMethods) {
  var results = {};

  if (_elucidataType2['default'].isFunction(source)) {
    source = getInlineMethods(source);
  }

  for (var _name in source) {
    var prop = source[_name];

    if (allowNonMethods === true) {
      results[_name] = prop;
    } else {

      if (_elucidataType2['default'].isFunction(prop)) {
        results[_name] = prop;
      }
    }
  }

  return results;
}

function getInlineMethods(source) {

  if (!('getOwnPropertyNames' in Object)) {
    // Probably mobile?
    return source.prototype // this should work, needs more testing
    ;
  }

  var instance = new source(),
      methods = {};

  Object.getOwnPropertyNames(source.prototype).forEach(function (name) {
    if (name !== 'constructor') {
      methods[name] = source.prototype[name];
    }
  });

  return methods;
}
module.exports = exports['default'];