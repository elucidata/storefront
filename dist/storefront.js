!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Storefront=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Runtime= require( './lib/runtime')

// module.exports= Runtime.newInstance()
module.exports= new Runtime()

},{"./lib/runtime":15}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = alias;

function alias(target, prop) {
  for (var _len = arguments.length, aliases = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    aliases[_key - 2] = arguments[_key];
  }

  var item = target[prop];

  aliases.forEach(function (alias) {
    target[alias] = item;
  });
}

module.exports = exports["default"];
},{}],3:[function(require,module,exports){
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
},{"elucidata-type":20}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = camelize;

function camelize(string) {
  return String(string).replace(/(?:^|[-_])(\w)/g, function (_, char) {
    return char ? char.toUpperCase() : '';
  });
}

module.exports = exports['default'];
},{}],5:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (process){
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
}).call(this,require('_process'))
},{"./camelize":4,"./flatten":11,"_process":19}],7:[function(require,module,exports){
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
},{"./console":5,"./now":14,"./uid":17}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = ensure;

function ensure(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var error, args, args_index;

    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      args = [a, b, c, d, e, f];
      args_index = 0;

      error = new Error('Violation: ' + format.replace(/%s/g, function () {
        return args[args_index++];
      }));
    }

    error.framesToPop = 1; // we don't care about ensure's own frame
    throw error;
  }
}

// module.exports= ensure

module.exports = exports['default'];
},{}],9:[function(require,module,exports){
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
},{"./camelize":4,"./subscriptions":16}],10:[function(require,module,exports){
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
},{"elucidata-type":20}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = flatten;

function flatten(arrays) {
  var merged = [];

  return merged.concat.apply(merged, arrays);
}

module.exports = exports["default"];
},{}],12:[function(require,module,exports){
(function (process){
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
}).call(this,require('_process'))
},{"./alias":2,"./bind-all":3,"./camelize":4,"./extract-methods":10,"./merge":13,"_process":19,"elucidata-type":20}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = merge;

function merge(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
  });

  return target;
}

module.exports = exports["default"];
},{}],14:[function(require,module,exports){
/* global performance */
'use strict';

exports.__esModule = true;
var now = (function () {
  if (typeof performance === 'object' && performance.now) {
    return performance.now.bind(performance);
  } else if (Date.now) {
    return Date.now.bind(Date);
  } else {
    return function () {
      return new Date().getTime();
    };
  }
})();

exports['default'] = now;
module.exports = exports['default'];
},{}],15:[function(require,module,exports){
(function (process,global){
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
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./alias":2,"./bind-all":3,"./camelize":4,"./console":5,"./create-event":6,"./dispatcher":7,"./ensure":8,"./event-helper-mixin":9,"./flatten":11,"./manager":12,"./merge":13,"./now":14,"./subscriptions":16,"./uid":17,"./version":18,"_process":19,"elucidata-type":20,"eventemitter3":21}],16:[function(require,module,exports){
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
},{"./alias":2,"./camelize":4}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = uid;
var _lastGeneratedUID = 0;

function uid() {
  var radix = arguments[0] === undefined ? 36 : arguments[0];

  var now = Math.floor(new Date().getTime() / 1000);

  while (now <= _lastGeneratedUID) {
    now += 1;
  }

  _lastGeneratedUID = now;

  return now.toString(radix);
}

module.exports = exports["default"];
},{}],18:[function(require,module,exports){
"use strict";

module.exports = "0.8.0";
},{}],19:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],20:[function(require,module,exports){
(function() {
  var name, type, _elementTestRe, _fn, _i, _keys, _len, _ref, _typeList;

  _typeList = "Boolean Number String Function Array Date RegExp Undefined Null NodeList".split(" ");

  _elementTestRe = /element$/;

  _keys = Object.keys || function(obj) {
    var key, v, _results;
    _results = [];
    for (key in obj) {
      v = obj[key];
      _results.push(key);
    }
    return _results;
  };

  type = (function() {
    var classToType, elemParser, name, toStr, _i, _len;
    toStr = Object.prototype.toString;
    elemParser = /\[object HTML(.*)\]/;
    classToType = {};
    for (_i = 0, _len = _typeList.length; _i < _len; _i++) {
      name = _typeList[_i];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var found, strType;
      strType = toStr.call(obj);
      if (found = classToType[strType]) {
        return found;
      } else if (found = strType.match(elemParser)) {
        return found[1].toLowerCase();
      } else {
        return "object";
      }
    };
  })();

  _ref = _typeList.concat(['Object']);
  _fn = function(name) {
    var nameLower;
    nameLower = name.toLowerCase();
    type["is" + name] = function(target) {
      return type(target) === nameLower;
    };
    return type["isNot" + name] = function(target) {
      return type(target) !== nameLower;
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    _fn(name);
  }

  type.isEmpty = function(target) {
    switch (type(target)) {
      case 'null':
        return true;
      case 'undefined':
        return true;
      case 'string':
        return target === '';
      case 'object':
        return _keys(target).length === 0;
      case 'array':
        return target.length === 0;
      case 'number':
        return isNaN(target);
      case 'nodelist':
        return target.length === 0;
      default:
        return false;
    }
  };

  type.isNotEmpty = function(target) {
    return !type.isEmpty(target);
  };

  type.isElement = function(target) {
    return _elementTestRe.test(type(target));
  };

  type.isNotElement = function(target) {
    return !type.isElement(target);
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = type;
  } else {
    this.type = type;
  }

}).call(this);

},{}],21:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (this._events[evt].fn) return [this._events[evt].fn];

  for (var i = 0, l = this._events[evt].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[evt][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}]},{},[1])(1)
});