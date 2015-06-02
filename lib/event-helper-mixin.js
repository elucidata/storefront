'use strict';

exports.__esModule = true;
exports['default'] = eventHelperMixin;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var _subscriptions = require('./subscriptions');

var _subscriptions2 = _interopRequireDefault(_subscriptions);

function eventHelperMixin(runtime) {
  var _subscriber = (0, _subscriptions2['default'])(runtime);

  return {

    onStoreEvent: function onStoreEvent(storeName, eventName, callback) {
      if (!this._storefrontSubscriptions) {
        this._storefrontSubscriptions = _subscriber();
      }
      this._storefrontSubscriptions.on(storeName, eventName, callback);
    },

    componentWillUnmount: function componentWillUnmount() {
      if (this._storefrontSubscriptions) {
        this._storefrontSubscriptions.release();
        this._storefrontSubscriptions = null;
      }
    }

  };
}

module.exports = exports['default'];