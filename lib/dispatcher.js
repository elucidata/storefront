'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _console = require('./console');

var _console2 = _interopRequireDefault(_console);

var _now = require('./now');

var _now2 = _interopRequireDefault(_now);

var _uid = require('./uid');

var _uid2 = _interopRequireDefault(_uid);

var THRESHOLD = 10; // In milliseconds

var _singletonInstance = null,
    _logDispatches = false;

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this.active = false;
    this._handlers = {};
    this._processed = {};
    this._tokenList = [];
    this._queue = [];
  }

  Dispatcher.prototype.register = function register(handler, preferredToken) {
    if (preferredToken && this._handlers.hasOwnProperty(preferredToken)) {
      preferredToken = (0, _uid2['default'])();
    }

    var token = preferredToken || (0, _uid2['default'])();

    this._handlers[token] = handler;
    this._tokenList = Object.keys(this._handlers);

    return token;
  };

  Dispatcher.prototype.deregister = function deregister(token) {
    var handler = this._handlers[token];
    if (handler) delete this._handlers[token];
    return handler;
  };

  Dispatcher.prototype.waitFor = function waitFor(tokens) {
    var _this = this;

    if (!this.active) return this(tokens || []).forEach(function (token) {
      // support waitFor params being store instances or store tokens:
      _this._callHandler(token.token || token);
    });
    return this;
  };

  Dispatcher.prototype.dispatch = function dispatch(action, callback) {
    if (this.active) {
      this._queue.push([action, callback]);
      return this;
    }

    var length = this._tokenList.length,
        index = 0,
        start_time = undefined,
        duration = undefined,
        label = undefined;

    if (_logDispatches) {
      label = action.type;
      _console2['default'].time(label);
      _console2['default'].group(label);
    }

    if (length) {
      start_time = (0, _now2['default'])();
      this.active = true;
      this._currentAction = action;
      this._processed = {};

      while (index < length) {
        this._callHandler(this._tokenList[index]);
        index += 1;
      }

      this._currentAction = null;
      this.active = false;

      duration = (0, _now2['default'])() - start_time;

      if (_logDispatches && duration > THRESHOLD) {
        _console2['default'].info('Dispatch of', action.type, 'took >', THRESHOLD, 'ms');
      }
    }

    if (_logDispatches) {
      _console2['default'].groupEnd(label);
      _console2['default'].timeEnd(label);
    }

    if (callback) {
      callback();
    }

    if (this._queue.length) {
      // Should this happen on the nextTick?

      var _queue$shift = this._queue.shift();

      var nextAction = _queue$shift[0];
      var nextCallback = _queue$shift[1];

      this.dispatch(nextAction, nextCallback);
    }

    return this;
  };

  Dispatcher.prototype._callHandler = function _callHandler(token) {
    if (this._processed[token] === true || !this.active) return;
    var handler = this._handlers[token];

    handler.call(this, this._currentAction, this, token);
    this._processed[token] = true;
  };

  Dispatcher.getInstance = function getInstance() {
    if (_singletonInstance === null) {
      _singletonInstance = new this();
    }
    return _singletonInstance;
  };

  Dispatcher.enableLogging = function enableLogging(enabled) {
    _logDispatches = enabled;
  };

  return Dispatcher;
})();

exports['default'] = Dispatcher;
module.exports = exports['default'];
// jshint ignore:line
// global[ 'console'].info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
// Should the callback be sent anything?