!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Storefront=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports= require('./lib/core')

},{"./lib/core":4}],2:[function(require,module,exports){
module.exports=
function alias(/* target, prop, ...aliases */) {
  var aliases= Array.prototype.slice.call(arguments),
      target= aliases.shift(),
      prop= aliases.shift(),
      item= target[ prop]
  aliases.forEach(function( alias){
    target[ alias]= item
  })
}

},{}],3:[function(require,module,exports){
module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, function( _, c) {
    return c ? c.toUpperCase () : ''
  })
}

},{}],4:[function(require,module,exports){
var Runtime= require( './runtime'),
    alias= require( './alias'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  define:function( name, builder) {
    return runtime.defineComposite( name, builder)
  },

  defineStore:function( name, builder) {
    return runtime.defineStore( name, builder)
  },

  defineClerk:function( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  get:function( name) {
    return runtime.getInstance( name)
  },

  configure:function( settings) {
    runtime.configure( settings)
    return this
  },

  onChange:function( fn) {
    runtime.onAnyChange( fn)
    return this
  },

  offChange:function( fn) {
    runtime.offAnyChange( fn)
    return this
  },

  _internals: runtime
}


alias( module.exports, 'defineStore', 'Store')
alias( module.exports, 'defineClerk', 'Clerk')

},{"./alias":2,"./runtime":11}],5:[function(require,module,exports){
var uid= require('./uid'),
    now= require('./now')

var THRESHOLD= 10 // In milliseconds



  function Dispatcher() {"use strict";
    this.$Dispatcher_handlers= {}
    this.$Dispatcher_processed= {}
    this.$Dispatcher_tokenList= []
    this.$Dispatcher_queue= []
    this.active= false
  }

  Dispatcher.prototype.$Dispatcher_destructor=function() {"use strict";
    this.$Dispatcher_handlers= null
    this.$Dispatcher_processed= null
    this.$Dispatcher_tokenList= null
    this.$Dispatcher_queue= null
    this.active= false
  };

  Dispatcher.prototype.dispose=function() {"use strict";
    this.$Dispatcher_destructor()
  };

  Dispatcher.prototype.register=function(handler, preferredToken)  {"use strict";
    if( preferredToken && this.$Dispatcher_handlers.hasOwnProperty(preferredToken) ) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this.$Dispatcher_handlers[token]= handler
    this.$Dispatcher_tokenList= Object.keys( this.$Dispatcher_handlers )
    return token
  };

  Dispatcher.prototype.deregister=function(token)  {"use strict";
    var handler;
    if( handler= this.$Dispatcher_handlers[token] )  // jshint ignore:line
        delete this.$Dispatcher_handlers[ token ]
    return handler
  };

  Dispatcher.prototype.waitFor=function(tokens)  {"use strict";
    if(! this.active ) return this
    // Trigger each one
    for (var i=0, l=tokens.length; i < l; i++) {
      var token = tokens[ i ].token || tokens[ i ]
      this.$Dispatcher_callHandler( token )
    }
    return this
  };

  Dispatcher.prototype.dispatch=function(action, callback)  {"use strict";
    if( this.active ) {
      this.$Dispatcher_queue.push([ action, callback ])
      return this
    }

    var length= this.$Dispatcher_tokenList.length,
        index= 0, startTime, duration

    if( length ) {
      startTime= now()
      this.active= true
      this.$Dispatcher_currentAction= action
      this.$Dispatcher_processed= {}

      while( index < length ) {
          this.$Dispatcher_callHandler( this.$Dispatcher_tokenList[ index ] )
          index += 1
      }

      this.$Dispatcher_currentAction= null
      this.active= false

      duration= now() - startTime

      if( duration > THRESHOLD ) {
        window['console'].info('Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( callback ) callback() // Should the callback be sent anything?

    if( this.$Dispatcher_queue.length ) {
      // Should this happen on the nextTick?
      var queueAction= this.$Dispatcher_queue.shift()
      this.dispatch( queueAction[0], queueAction[1])
    }

    return this
  };

  Dispatcher.prototype.$Dispatcher_callHandler=function(token)  {"use strict";
    if( this.$Dispatcher_processed[token] === true || ! this.active ) return
    var handler= this.$Dispatcher_handlers[ token ]
    handler.call( this, this.$Dispatcher_currentAction, this, token )
    this.$Dispatcher_processed[ token ]= true
  };

  Dispatcher.getInstance=function() {"use strict";
    if( singleton_instance === null ) {
      singleton_instance= new Dispatcher()
    }
    return singleton_instance
  };


var singleton_instance= null

module.exports= Dispatcher

},{"./now":10,"./uid":12}],6:[function(require,module,exports){
var kind= require( 'elucidata-type'),
    createManager= require( './manager')

module.exports=
function Factory(runtime, name, type, builder, instance) {
  instance= instance || {}
  instance.name= instance.name || name

  var returnValue,
      manager= createManager( runtime, name, type, instance)

  if( kind.isFunction( builder)) {
    returnValue= builder( manager)
  }
  else if( kind.isObject( builder)) {
    returnValue= builder
  }
  else {
    throw new Error( "Wrong builder type: Must provide a builder function or object.")
  }

  if( kind.isObject( returnValue)) {
    manager.exposes( returnValue)
  }

  if( instance.token == null) {  // jshint ignore:line
    instance.token= runtime.dispatcher.register(function( action){
      var handler;
      if( handler= instance._handlers[ action.type]) {  // jshint ignore:line
        handler( action)
      }
    })
  }

  // NOTE: I'd like to remove the handler list from the instance...
  if( instance._handlers == null) {  // jshint ignore:line
    instance._handlers= {}
  }

  return instance
}

},{"./manager":8,"elucidata-type":15}],7:[function(require,module,exports){
module.exports=
function flatten( arrays) {
  var merged= []
  return merged.concat.apply( merged, arrays)
}

},{}],8:[function(require,module,exports){
(function (process){
var merge= require( './merge'),
    alias= require( './alias'),
    camelize= require( './camelize'),
    kind= require( 'elucidata-type')

module.exports=
function Manager( runtime, name, type, instance) {
  instance= instance || {}

  // Shared props...
  var manager= {
    _name: name,
    _type: type,
    _instance: instance,

    exposes:function( methods) {
      Object.keys( methods).forEach(function( methodName){
        instance[ methodName]= methods[ methodName]
      })
    },

    getStore:function( storeName) {
      if( storeName ) {
        return runtime.getInstance( storeName )
      }
      else {
        return instance
      }
    },

    createEvent:function( eventName) {
      var event= runtime.createEvent( name, eventName),
      emitterFn= event.emit.bind( event)

      manager.exposes( event.public)
      instance[ 'emit'+ camelize( eventName)]= emitterFn

      return emitterFn
    }
  }
  alias( manager, 'exposes', 'expose')
  alias( manager, 'createEvent', 'defineEvent')

  if( type === 'clerk' || type === '*') {
    // Dispatcher method...
    var dispatch= function(type, payload, callback) {
      process.nextTick(function(){
        runtime.dispatcher.dispatch(
          { origin: name, type:type, payload:payload },
          callback
        )
      })
    }
    dispatch.send= dispatch

    manager= merge( manager, {

      actions:function( actionDefinitions) {
        Object.keys( actionDefinitions).forEach(function( actionName){
          var eventName= name +'_'+ actionName,
              fn= actionDefinitions[ actionName],
              boundDispatch= dispatch.bind( null, eventName)

          fn.displayName= eventName
          instance[ actionName]= fn.bind( instance, boundDispatch)
        })
      }
    })

    alias( manager, 'actions', 'action')
  }

  if( type === 'store' || type === '*') {
    var notificationEvent= runtime.createEvent( name, 'notify'),
        changeEvent= runtime.createEvent( name, 'change')

    if(! instance._handlers) {
      instance._handlers= {}
    }

    manager= merge( manager, {

      _handlers: {},

      waitFor:function( ) {for (var stores=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) stores.push(arguments[$__0]);
        return runtime.dispatcher.waitFor( stores);
      },

      hasChanged:function() {
        changeEvent.emitFlat( arguments)
      },

      notify:function( msg) {
        notificationEvent.emit( msg)
      },

      handles:function( store, handlers) {
        if( arguments.length === 1) {
          handlers= store
          store= name//runtime.getInstance( 'facade', name)
        }
        else if( kind.isObject( store)) {
          store= store.name//runtime.getInstance( 'facade', store)
        }

        var getEventName= function(actionName){
          return store +'_'+ actionName
        }

        Object.keys( handlers).forEach(function( actionName){
          var eventName= getEventName( actionName),
              fn= handlers[ actionName]
          instance._handlers[ eventName]= fn //.bind(handlers)
        })
      },

      getClerk:function() {
        // return runtime.getInstance( 'clerk', name)
        return instance
      }
    })

    alias( manager, 'handles', 'handle', 'observes', 'observe')
    alias( manager, 'hasChanged', 'dataDidChange', 'dataHasChanged')
    alias( manager, 'exposes', 'provides', 'provide')

    manager.exposes( changeEvent.public)
    manager.exposes( notificationEvent.public)
  }

  return manager
}

}).call(this,require('_process'))
},{"./alias":2,"./camelize":3,"./merge":9,"_process":14,"elucidata-type":15}],9:[function(require,module,exports){
module.exports=
function merge(/* target, ...sources */) {
  var sources= Array.prototype.slice.call( arguments),
      target= sources.shift()

  sources.forEach(function( source){
    Object.
      keys( source).
      forEach(function( key){
        target[ key]= source[ key]
      })
  })

  return target
}

},{}],10:[function(require,module,exports){

/* global performance */
var now= (function(){
  if( typeof performance === 'object' && performance.now ) {
    return performance.now.bind( performance )
  }
  else if( Date.now ) {
    return Date.now.bind(Date)
  }
  else {
    return function() {
      return (new Date()).getTime()
    }
  }
})()

module.exports= now

},{}],11:[function(require,module,exports){
(function (process){
var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    storeFactory= require( './factory')

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){Runtime[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;Runtime.prototype=Object.create(____SuperProtoOfEventEmitter);Runtime.prototype.constructor=Runtime;Runtime.__superConstructor__=EventEmitter;

  function Runtime() {"use strict";
    EventEmitter.call(this)
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {}
    this.builders= []
    this.events= {}
    this.$Runtime_anyChangeEvent= this.createEvent('*', 'any-change')
    this.$Runtime_dataChanges= []
    this.$Runtime_timer= false
    this.configure()
  }

  Runtime.prototype.configure=function(settings) {"use strict";
    // Default config settings
    this.settings= merge({
      useRAF: false,
      verbose: true
    }, settings || {})
  };

  Runtime.prototype.createEvent=function(storeName, eventName) {"use strict";
    var event_key= storeName +':'+ eventName,
        helpers= {},
        api= null

    if( api= this.events[ event_key]) {  // jshint ignore:line
      // TODO: Should a recycled event check some flag somewhere to know if it show clear out the listener queue?
      return api
    }

    api= {

      public: {},

      emit: function() {
        var params= Array.prototype.slice.call( arguments)
        params.unshift( event_key)
        process.nextTick(function(){
          this.emit.apply( this, params)
        }.bind(this))
      }.bind(this),

      emitNow: function() {
        var params= Array.prototype.slice.call( arguments)
        params.unshift( event_key)
        this.emit.apply( this, params)
      }.bind(this),

      emitFlat: function() {
        var params= flatten( [ event_key].concat( Array.prototype.slice.call( arguments)))
        process.nextTick(function(){
          this.emit.apply( this, params)
        }.bind(this))
      }.bind(this)
    }

    api.public[ 'on'+ camelize( eventName)]= function( fn) {
      this.on( event_key, fn)
    }.bind(this)

    api.public[ 'off'+ camelize( eventName)]= function( fn) {
      this.removeListener( event_key, fn)
    }.bind(this)

    this.events[ event_key]= api

    return api
  };

  Runtime.prototype.knownEvents=function() {"use strict";
    return Object.keys( this.events)
  };

  Runtime.prototype.defineComposite=function(name, builder) {"use strict";
    return this.$Runtime_buildFactory( name, '*', builder)
  };

  Runtime.prototype.defineStore=function(name, builder) {"use strict";
    return this.$Runtime_buildFactory( name, 'store', builder)
  };

  Runtime.prototype.defineClerk=function(name, builder) {"use strict";
    return this.$Runtime_buildFactory( name, 'clerk', builder)
  };

  Runtime.prototype.getInstance=function(name)  {"use strict";
    return this.registry[ name]
  };

  Runtime.prototype.hasStore=function(name) {"use strict";
    return this.registry.hasOwnProperty( name)
  };

  Runtime.prototype.onAnyChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.onAnyChange( fn)
  };

  Runtime.prototype.offAnyChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.offAnyChange( fn)
  };

  Runtime.prototype.recreateStore=function(name) {"use strict";
    delete this.registry[ name]

    this.builders
      .filter(function( def){
        return def.name === name
      })
      .forEach(function( info){
        this.$Runtime_buildFactory( info.name, info.type, info.builder, false)
      }.bind(this))

    return this.registry[ name]
  };

  Runtime.prototype.$Runtime_buildFactory=function(name, type, builder, saveBuilder) {"use strict";
    var instance= this.registry[ name]

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
    }

    instance= storeFactory(this, name, type, builder, instance)

    this.registry[ name]= instance

    if( saveBuilder !== false) {
      this.builders.push({ name:name, type:type, builder:builder })
    }

    return instance
  };

  Runtime.prototype.$Runtime_trackChangeFor=function(name) {"use strict";
    var eventName= name +':change'
    this.on( eventName, function(){
      this.$Runtime_dataChanges.push({ type:eventName, params:Array.prototype.slice.call(arguments)})

      if(! this.$Runtime_timer) {
        process.nextTick( this.$Runtime_relayDataChanges.bind( this))
        this.$Runtime_timer= true
      }
    }.bind(this))
  };

  Runtime.prototype.$Runtime_relayDataChanges=function() {"use strict";
    if( this.$Runtime_dataChanges.length) {
      this.$Runtime_anyChangeEvent.emitNow( this.$Runtime_dataChanges)
      this.$Runtime_dataChanges= []
    }
    this.$Runtime_timer= false
  };


// Runtime API
module.exports= Runtime

}).call(this,require('_process'))
},{"./camelize":3,"./dispatcher":5,"./factory":6,"./flatten":7,"./merge":9,"_process":14,"events":13}],12:[function(require,module,exports){
var lastId = 0

function uid ( radix){
  var now = Math.floor( (new Date()).getTime() / 1000 )
  radix= radix || 36

  while ( now <= lastId ) {
    now += 1
  }

  lastId = now

  return now.toString( radix )
}

module.exports= uid

},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}]},{},[1])(1)
});