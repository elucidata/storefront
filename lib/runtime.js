'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _manager = require('./manager');

var _manager2 = _interopRequireDefault(_manager);

var _alias = require('./alias');

var _alias2 = _interopRequireDefault(_alias);

var _bindAll = require('./bind-all');

var _bindAll2 = _interopRequireDefault(_bindAll);

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var _console = require('./console');

var _console2 = _interopRequireDefault(_console);

var _createEvent2 = require('./create-event');

var _createEvent3 = _interopRequireDefault(_createEvent2);

var _ensure = require('./ensure');

var _ensure2 = _interopRequireDefault(_ensure);

var _eventHelperMixin = require('./event-helper-mixin');

var _eventHelperMixin2 = _interopRequireDefault(_eventHelperMixin);

var _flatten = require('./flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _elucidataType = require('elucidata-type');

var _elucidataType2 = _interopRequireDefault(_elucidataType);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

var _now = require('./now');

var _now2 = _interopRequireDefault(_now);

var _subscriptions = require('./subscriptions');

var _subscriptions2 = _interopRequireDefault(_subscriptions);

var _uid = require('./uid');

var _uid2 = _interopRequireDefault(_uid);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var DEFAULTS = {
  asyncDispatch: true,
  freezeInstance: false,
  useRAF: true,
  verbose: false,
  logging: false,
  singletonDispatcher: false
};

var Runtime = (function () {
  function Runtime(settings) {
    _classCallCheck(this, Runtime);

    this._emitter = new _eventemitter32['default']();
    this._registry = {};
    this._managers = {};
    this._builders = [];
    this._events = {};
    this._anyChangeEvent = this.createEvent('*', 'any-change');
    this._dataChanges = [];
    this._timer = false;
    this.version = _version2['default'];

    this.configure(settings);

    if (this.settings.singletonDispatcher) {
      this.dispatcher = _dispatcher2['default'].getInstance();
    } else {
      this.dispatcher = new _dispatcher2['default']();
    }

    this.util = {
      alias: _alias2['default'],
      bindAll: _bindAll2['default'],
      camelize: _camelize2['default'],
      ensure: _ensure2['default'],
      eventHelperMixin: (0, _eventHelperMixin2['default'])(this),
      flatten: _flatten2['default'],
      kind: _elucidataType2['default'],
      merge: _merge2['default'],
      now: _now2['default'],
      subscriptions: (0, _subscriptions2['default'])(this),
      uid: _uid2['default'] };

    // DEPRECATED:
    this.mixins = {
      eventHelper: (0, _eventHelperMixin2['default'])(this),
      subscriptions: (0, _subscriptions2['default'])(this)
    };

    (0, _alias2['default'])(this, 'get', 'getInstance');
  }

  Runtime.prototype.configure = function configure() {
    var settings = arguments[0] === undefined ? {} : arguments[0];

    // Default config settings
    this.settings = (0, _merge2['default'])({}, DEFAULTS, settings);

    _dispatcher2['default'].enableLogging(this.settings.logging);

    return this;
  };

  Runtime.prototype.newInstance = function newInstance(settings) {
    return new Runtime(settings || this.settings);
  };

  Runtime.prototype.createEvent = function createEvent(storeName, eventName, options) {
    var event = (0, _createEvent3['default'])(storeName, eventName, this._emitter, options);

    if (!this._events[event.name]) {
      this._events[event.name] = event;
    }

    return this._events[event.name];
  };

  Runtime.prototype.knownEvents = function knownEvents() {
    return Object.keys(this._events);
  };

  Runtime.prototype.define = function define(name, builder) {
    if (_elucidataType2['default'].isUndefined(builder)) {
      builder = name;
      name = (0, _uid2['default'])();
    }
    return this._buildFactory(name, builder);
  };

  Runtime.prototype.get = function get(name, stubMissing) {
    var instance = this._registry[name];

    if (!instance) {
      this._warn('Storefront: Store', name, 'is not defined.');
      if (stubMissing === true) {
        this._info('Storefront: Building stub for', name);
        instance = { name: name };
        this._registry[name] = instance;
      }
    }

    return instance;
  };

  Runtime.prototype.getManager = function getManager(name) {
    return this._managers[name];
  };

  Runtime.prototype.hasStore = function hasStore(name) {
    return this._registry.hasOwnProperty(name);
  };

  Runtime.prototype.onChange = function onChange(fn) {
    var _this = this;

    this._anyChangeEvent['public'].onAnyChange(fn);
    return function () {
      _this._anyChangeEvent.publish.offAnyChange(fn);
    };
  };

  Runtime.prototype.offChange = function offChange(fn) {
    this._anyChangeEvent['public'].offAnyChange(fn);
    return this;
  };

  Runtime.prototype.size = function size() {
    return this.storeNames().length;
  };

  Runtime.prototype.storeNames = function storeNames() {
    return Object.keys(this._registry);
  };

  Runtime.prototype.allStores = function allStores() {
    var _this2 = this;

    var all = {};

    Object.keys(this._registry).forEach(function (name) {
      all[name] = _this2._registry[name];
    });

    return all;
  };

  Runtime.prototype.recreateStore = function recreateStore(name) {
    var _this3 = this;

    var manager = this.getManager(name);

    if (manager) {
      manager.resetInternals();
    }

    this._builders.filter(function (def) {
      return def.name === name;
    }).forEach(function (info) {
      _this3._buildFactory(info.name, info.builder, false);
    });

    return this.get(name);
  };

  Runtime.prototype._buildFactory = function _buildFactory(name, builder, saveBuilder) {
    var instance = this._registry[name],
        manager = this._managers[name],
        returnValue = undefined;

    if (instance) {
      this._warn('Storefront:', name, 'already defined: Merging definitions.');
    } else {
      instance = { name: name };
      this._registry[name] = instance;
    }

    if (!manager) {
      manager = new _manager2['default'](this, name, instance);
      this._managers[name] = manager;
      this._trackChangeFor(name);
    }

    if (_elucidataType2['default'].isFunction(builder)) {
      returnValue = builder(manager);
    } else if (_elucidataType2['default'].isObject(builder)) {
      returnValue = builder;
    } else {
      throw new Error('Wrong builder type: Must provide a builder function or object.');
    }

    if (_elucidataType2['default'].isObject(returnValue)) {
      manager.expose(returnValue, true);
    }

    if (this.settings.freezeInstance === true) {
      Object.freeze(instance);
    }

    if (saveBuilder !== false) {
      this._builders.push({ name: name, builder: builder, manager: manager });
    }

    return this.get(name);
  };

  Runtime.prototype._trackChangeFor = function _trackChangeFor(name) {
    var _this4 = this;

    var eventName = '' + name + ':change';

    this._emitter.on(eventName, function () {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      _this4._dataChanges.push({ type: eventName, params: params });

      if (!_this4._timer) {
        if (_this4.settings.useRAF && global.requestAnimationFrame) {
          requestAnimationFrame(_this4._relayDataChanges.bind(_this4));
        } else {
          process.nextTick(_this4._relayDataChanges.bind(_this4));
        }
        _this4._timer = true;
      }
    });
  };

  Runtime.prototype._stopTrackingChangesFor = function _stopTrackingChangesFor(name) {
    var eventName = '' + name + ':change';
    this._emitter.removeListener(eventName);
  };

  Runtime.prototype._relayDataChanges = function _relayDataChanges() {
    if (this._dataChanges.length) {
      this._anyChangeEvent.emitNow(this._dataChanges);
      this._dataChanges = [];
    }
    this._timer = false;
  };

  Runtime.prototype._warn = function _warn() {
    if (this.settings.verbose) {
      _console2['default'].warn.apply(_console2['default'], arguments);
    }
  };

  Runtime.prototype._info = function _info() {
    if (this.settings.verbose) {
      _console2['default'].info.apply(_console2['default'], arguments);
    }
  };

  return Runtime;
})();

exports['default'] = Runtime;
module.exports = exports['default'];