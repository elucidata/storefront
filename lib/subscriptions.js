'use strict';

exports.__esModule = true;
exports['default'] = subscriptions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _alias = require('./alias');

var _alias2 = _interopRequireDefault(_alias);

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var Subscriptions = (function () {
  function Subscriptions(runtime) {
    _classCallCheck(this, Subscriptions);

    this._runtime = runtime;
    this._storeListeners = [];
    (0, _alias2['default'])(this, 'on', 'onStoreEvent', 'onEvent');
    (0, _alias2['default'])(this, 'release', 'off', 'releaseAll');
  }

  Subscriptions.prototype.size = function size() {
    return this._storeListeners.length;
  };

  Subscriptions.prototype.on = function on(storeName, eventName, callback) {
    storeName = storeName.name || storeName; // in case they send a store instance

    var store = this._runtime.getInstance(storeName),
        hookup = null;

    if (store) {
      eventName = (0, _camelize2['default'])(eventName);

      if (hookup = store['on' + eventName]) {
        // jshint ignore:line
        var disconnector = hookup(callback);

        this._storeListeners.push(disconnector);
      } else {

        if (this._runtime.settings.verbose) {
          console.warn('Storefront: Event', eventName, 'isn\'t supported by store:', storeName);
        }
      }
    } else {

      if (this._runtime.settings.verbose) {
        console.warn('Storefront: Store', storeName, 'not found');
      }
    }

    return this;
  };

  Subscriptions.prototype.release = function release() {
    this._storeListeners.forEach(function (disconnect) {
      return disconnect();
    });
    this._storeListeners = [];
    return this;
  };

  return Subscriptions;
})();

function subscriptions(runtime) {
  return function () {
    return new Subscriptions(runtime);
  };
}

module.exports = exports['default'];