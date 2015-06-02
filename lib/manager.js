'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _elucidataType = require('elucidata-type');

var _elucidataType2 = _interopRequireDefault(_elucidataType);

var _alias = require('./alias');

var _alias2 = _interopRequireDefault(_alias);

var _bindAll = require('./bind-all');

var _bindAll2 = _interopRequireDefault(_bindAll);

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var _extractMethods = require('./extract-methods');

var _extractMethods2 = _interopRequireDefault(_extractMethods);

var _merge = require('./merge');

var _merge2 = _interopRequireDefault(_merge);

var Manager = (function () {
  function Manager(runtime, name, instance) {
    var _this = this;

    _classCallCheck(this, Manager);

    this.runtime = runtime;
    this.name = name;

    this._instance = instance;
    this._handlers = {};
    this._notifyEvent = runtime.createEvent(name, 'notify');
    this._changeEvent = runtime.createEvent(name, 'change');

    this.expose(this._notifyEvent['public']);
    this.expose(this._changeEvent['public']);
    this.expose({
      listen: this._changeEvent['public'].onChange,
      unlisten: this._changeEvent['public'].offChange
    });

    (0, _bindAll2['default'])(this, 'dispatch', 'notify', 'actions', 'waitFor', 'hasChanged', 'before', 'expose', 'get', 'before', 'createEvent', 'invoke');

    (0, _alias2['default'])(this, 'actions', 'action', 'observe', 'observes');
    (0, _alias2['default'])(this, 'get', 'getStore', 'getClerk');
    (0, _alias2['default'])(this, 'expose', 'exposes', 'outlet', 'outlets');
    (0, _alias2['default'])(this, 'createEvent', 'defineEvent');
    (0, _alias2['default'])(this, 'hasChanged', 'dataDidChange', 'dataHasChanged');

    if (instance.token == null) {
      // jshint ignore:line
      instance.token = runtime.dispatcher.register(function (action) {
        var handler = _this._handlers[action.type];
        if (handler) {
          handler(action);
        }
      });
    }
  }

  Manager.prototype.dispatch = function dispatch(type, payload, callback) {
    var _this2 = this;

    var doDispatch = function doDispatch() {
      _this2.runtime.dispatcher.dispatch({ origin: _this2.name, type: type, payload: payload }, callback);
    };

    if (this.runtime.settings.aysncDispatch) {
      process.nextTick(doDispatch);
    } else {
      doDispatch();
    }

    return this;
  };

  Manager.prototype.invoke = function invoke(cmd) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    var fn = this._instance[cmd];

    if (_elucidataType2['default'].isFunction(fn)) {
      return fn.apply(this._instance, params);
    } else {
      throw new Error('Method ' + cmd + ' not found!');
    }
  };

  Manager.prototype.notify = function notify(message) {
    this._notifyEvent.emitNow(message);
    return this;
  };

  Manager.prototype.before = function before(methods) {
    var _this3 = this;

    methods = (0, _extractMethods2['default'])(methods);

    Object.keys(methods).forEach(function (actionName) {
      var eventName = '' + _this3.name + '_' + actionName,
          fn = methods[actionName],
          boundDispatch = _this3.dispatch.bind(_this3, eventName);

      fn.displayName = eventName;
      _this3._instance[actionName] = fn.bind(_this3._instance, boundDispatch);
    });

    return this;
  };

  Manager.prototype.actions = function actions(store, methods) {
    var _this4 = this;

    if (arguments.length === 1) {
      methods = store;
      store = this.name;
    } else if (_elucidataType2['default'].isObject(store)) {
      store = store.name;
    }

    methods = (0, _extractMethods2['default'])(methods);

    Object.keys(methods).forEach(function (actionName) {
      var eventName = '' + _this4.name + '_' + actionName,
          fn = methods[actionName];

      _this4._handlers[eventName] = fn.bind(_this4._instance); // Change!

      if (store == _this4.name && !_this4._instance[actionName]) {
        // Stub out an action...
        var stub = {};

        stub[actionName] = function (dispatch) {
          for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          if (args.length === 1) {
            dispatch(args[0]);
          } else {
            dispatch(args);
          }
        };

        // stub[ actionName ]._isStub = true

        _this4.before(stub);
      }
    });

    return this;
  };

  Manager.prototype.waitFor = function waitFor() {
    var _this5 = this;

    for (var _len3 = arguments.length, stores = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      stores[_key3] = arguments[_key3];
    }

    stores = stores.map(function (store) {
      if (_elucidataType2['default'].isString(store)) {
        return _this5.runtime.get(store);
      } else {
        return store;
      }
    });

    this.runtime.dispatcher.waitFor(stores);

    return this;
  };

  Manager.prototype.hasChanged = function hasChanged() {
    for (var _len4 = arguments.length, keys = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      keys[_key4] = arguments[_key4];
    }

    this._changeEvent.emit(keys);
    return this;
  };

  Manager.prototype.expose = function expose(methods) {
    var _this6 = this;

    var allowNonMethods = arguments[1] === undefined ? false : arguments[1];

    methods = (0, _extractMethods2['default'])(methods, allowNonMethods);

    Object.keys(methods).forEach(function (methodName) {
      if (_this6._instance.hasOwnProperty(methodName)) {
        var error = new Error('Redefinition of \'' + methodName + '\' in store ' + storeName + ' not allowed.');
        error.framesToPop = 3;
        throw error
        // let method= this._instance[ methodName ]

        // if(! method._isStub ) {
        //   let error= new Error( `Redefinition of '${ methodName }' in store ${ storeName } not allowed.` )
        //   error.framesToPop= 3
        //   throw error
        // }
        // else {
        //   console.log( "Method is a stub, go ahead.", methodName)
        // }
        ;
      }

      _this6._instance[methodName] = methods[methodName];
    });

    return this;
  };

  Manager.prototype.get = function get(storeName) {
    if (storeName) {
      return this.runtime.get(storeName, true);
    } else {
      return this._instance;
    }
  };

  Manager.prototype.createEvent = function createEvent(eventName) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var event = this.runtime.createEvent(name, eventName, options),
        emitterFn = options.async ? event.emitNextTick.bind(event) : event.emit.bind(event);

    this.expose(event['public']);
    this._instance['emit' + (0, _camelize2['default'])(eventName)] = emitterFn;

    return emitterFn;
  };

  // You shouldn't call this yourself... The runtime will if a resetStore call
  // is made -- usually only in testing!

  Manager.prototype.resetInternals = function resetInternals() {
    var _this7 = this;

    this._handlers = {};

    if (this._instance.token) {
      this.runtime.dispatcher.deregister(this._instance.token);
    }

    Object.keys(this._instance).forEach(function (key) {
      if (key !== 'name') {
        delete _this7._instance[key];
      }
    });
  };

  return Manager;
})();

exports['default'] = Manager;
module.exports = exports['default'];