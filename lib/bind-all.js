'use strict';

exports.__esModule = true;
exports['default'] = bindAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _elucidataType = require('elucidata-type');

var _elucidataType2 = _interopRequireDefault(_elucidataType);

function bindAll(target) {
  for (var _len = arguments.length, props = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    props[_key - 1] = arguments[_key];
  }

  props.forEach(function (key) {
    var prop = target[key];

    if (prop && _elucidataType2['default'].isFunction(prop)) {
      target[key] = prop.bind(target);
    }
  });

  return target;
}

module.exports = exports['default'];