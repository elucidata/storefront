'use strict';

exports.__esModule = true;
exports['default'] = createEvent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var _flatten = require('./flatten');

var _flatten2 = _interopRequireDefault(_flatten);

function createEvent(baseName, eventName, emitter) {
  var options = arguments[3] === undefined ? {} : arguments[3];

  var EVENT_KEY = '' + baseName + ':' + eventName;

  var eventApi = {

    name: EVENT_KEY,

    'public': {},

    emit: function emit() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      params.unshift(EVENT_KEY);
      // process.nextTick(() => {
      //   emitter.emit.apply( emitter, params)
      // })
      emitter.emit.apply(emitter, params);
      return eventApi;
    },

    emitNextTick: function emitNextTick() {
      for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      // CHANGE
      params.unshift(EVENT_KEY);
      process.nextTick(function () {
        emitter.emit.apply(emitter, params);
      });
      return eventApi;
    },

    emitNow: function emitNow() {
      for (var _len3 = arguments.length, params = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }

      params.unshift(EVENT_KEY);
      emitter.emit.apply(emitter, params);
      return eventApi;
    },

    emitFlat: function emitFlat() {
      for (var _len4 = arguments.length, params = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }

      var params = (0, _flatten2['default'])([EVENT_KEY].concat(params));
      emitter.emit.apply(emitter, params);
      // process.nextTick(()=>{
      //   emitter.emit.apply( emitter, params)
      // })
      return eventApi;
    }
  };

  eventApi['public']['on' + (0, _camelize2['default'])(eventName)] = function (fn) {
    emitter.on(EVENT_KEY, fn);
    return function unsubscribeToChanges() {
      emitter.removeListener(EVENT_KEY, fn);
    };
  };

  eventApi['public']['off' + (0, _camelize2['default'])(eventName)] = function (fn) {
    emitter.removeListener(EVENT_KEY, fn);
    return eventApi;
  };

  return eventApi;
}

module.exports = exports['default'];