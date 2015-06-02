'use strict';

exports.__esModule = true;
exports['default'] = camelize;

function camelize(string) {
  return String(string).replace(/(?:^|[-_])(\w)/g, function (_, char) {
    return char ? char.toUpperCase() : '';
  });
}

module.exports = exports['default'];