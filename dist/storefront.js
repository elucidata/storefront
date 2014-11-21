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
(function (process){
var alias= require( './alias'),
    type= require( 'elucidata-type')

function ClerkFactory( runtime, name, builder) {
  var instance= {}, returnValue

  var dispatch= function(type, payload, callback) {
    process.nextTick(function(){
      runtime.dispatcher.dispatch(
        { origin: name, type:type, payload:payload },
        callback
      )
    })
  }

  dispatch.send= dispatch

  var manager= {

    actions:function( actionDefinitions) {
      Object.
        keys( actionDefinitions).
        forEach(function( actionName){
          var eventName= name +'_'+ actionName,
              fn= actionDefinitions[ actionName],
              boundDispatch= dispatch.bind( null, eventName)

          fn.displayName= eventName
          instance[ actionName]= fn.bind( instance, boundDispatch)
        })
      return this
    },

    getStore:function() {
      return runtime.getInstance('store', name)
    }
  }

  alias( manager, 'actions', 'action', 'public')

  if( type.isFunction( builder)) {
    returnValue= builder( manager, manager.actions)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.actions( returnValue)
  }

  return instance
}

module.exports= ClerkFactory

}).call(this,require('_process'))
},{"./alias":2,"_process":13,"elucidata-type":14}],4:[function(require,module,exports){
var Runtime= require( './runtime'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  Store:function( name, builder) {
    return runtime.defineStore( name, builder)
  },

  Clerk:function( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  Facade:function( name, builder) {
    return runtime.defineFacade( name, builder)
  },

  onChange:function( fn) {
    runtime.onAnyChange( fn)
  },

  offChange:function( fn) {
    runtime.offAnyChange( fn)
  },

  _internals: runtime
}

},{"./runtime":9}],5:[function(require,module,exports){
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

    if( DEBUG ) {
      console.time( action.type )
      console.group( action.type )
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
        // alert('long!')
        window['console'].info('Dispatch took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( DEBUG) {
      console.debug( (duration || 0)+ 'ms')
      console.timeEnd( action.type )
      console.groupEnd( action.type )
    }


    if( callback ) callback() // Should the callback be sent anything?

    if( this.$Dispatcher_queue.length ) {
      // Should this happen on the nextTick?
      var queueAction= this.$Dispatcher_queue.shift()
      this.dispatch(queueAction[0], queueAction[1])
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

},{"./now":8,"./uid":11}],6:[function(require,module,exports){
function ensure(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    }
    else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about ensure's own frame
    throw error;
  }
}

module.exports= ensure

},{}],7:[function(require,module,exports){
var type= require('elucidata-type'),
    alias= require('./alias'),
    ensure= require('./ensure')


  function Storefront(name) {"use strict";
    this.name= name
  }


function Facade(runtime, name, builder) {
  var clerk= runtime.getInstance( 'clerk', name),
      store= runtime.getInstance( 'store', name),
      storeFront= new Storefront( name),
      manager= {
        exposes:function( methodsObj) {
          Object.
            keys( methodsObj).
            forEach(function( key){
              storeFront[ key]= methodsObj[ key]
            })
        }
      },
      returnValue

  ensure( clerk && store, "A Store and Clerk are required to create a facade for: "+ name)

  alias( manager, 'exposes', 'expose', 'public')

  if( type.isFunction( builder)) {
    returnValue= builder( manager)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.exposes( returnValue)
  }

  storeFront= Object.merge( storeFront, clerk)
  storeFront= Object.merge( storeFront, store)

  return Object.freeze( storeFront)
}

module.exports= Facade

},{"./alias":2,"./ensure":6,"elucidata-type":14}],8:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){
(function (process){
var StoreFactory= require('./store-factory'),
    ClerkFactory= require('./clerk-factory'),
    Dispatcher= require('./dispatcher'),
    Facade= require('./facade'),
    EventEmitter= require('events').EventEmitter

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){Runtime[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;Runtime.prototype=Object.create(____SuperProtoOfEventEmitter);Runtime.prototype.constructor=Runtime;Runtime.__superConstructor__=EventEmitter;

  function Runtime() {"use strict";
    EventEmitter.call(this)
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {
      store: {},
      clerk: {},
      facade: {}
    }
    this.factories= {
      store: {},
      clerk: {},
      facade: {}
    }
    this.events= {}

    this.$Runtime_anyChangeEvent= this.createEvent('*', 'any-change')
    this.$Runtime_dataChanges= []
    this.$Runtime_timer= false
  }

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
        var params= [ event_key].
          concat( Array.prototype.slice.call( arguments)).
          flatten()
        process.nextTick(function(){
          this.emit.apply( this, params)
        }.bind(this))
      }.bind(this)
    }

    api.public[ 'on'+ eventName.camelize( true)]= function( fn) {
      this.on( event_key, fn)
    }.bind(this)

    api.public[ 'off'+ eventName.camelize( true)]= function( fn) {
      this.removeListener( event_key, fn)
    }.bind(this)

    this.events[ event_key]= api

    return api
  };

  Runtime.prototype.knownEvents=function() {"use strict";
    return Object.keys( this.events)
  };

  Runtime.prototype.defineStore=function(name, builder) {"use strict";
    if( this.hasStore( name)) throw new Error("Store "+ name +" already defined!")

    this.factories.store[ name]= builder

    var store= this.registry.store[ name]= StoreFactory( this, name, builder)

    this.$Runtime_trackChangeFor( name)

    return store
  };

  Runtime.prototype.defineClerk=function(name, builder) {"use strict";
    if( this.hasClerk( name)) throw new Error("Clerk "+ name +" already defined!")

    this.factories.clerk[ name]= builder

    var clerk= this.registry.clerk[ name]= ClerkFactory( this, name, builder)

    return clerk
  };

  Runtime.prototype.defineFacade=function(name, builder) {"use strict";
    if( this.hasFacade( name)) throw new Error("Facade "+ name +" already defined!")

    this.factories.facade[ name]= builder

    var api= this.registry.facade[ name]= Facade( this, name, builder)

    return api
  };

  Runtime.prototype.getInstance=function(type, name)  {"use strict";
    return this.registry[ type][ name]
  };

  Runtime.prototype.getFactory=function(type, name)  {"use strict";
    return this.factories[ type][ name]
  };

  Runtime.prototype.hasStore=function(name) {"use strict";
    return this.registry.store.hasOwnProperty( name)
  };

  Runtime.prototype.hasClerk=function(name) {"use strict";
    return this.registry.clerk.hasOwnProperty( name)
  };

  Runtime.prototype.hasFacade=function(name) {"use strict";
    return this.registry.facade.hasOwnProperty( name)
  };

  Runtime.prototype.onAnyChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.onAnyChange( fn)
  };
  Runtime.prototype.offAnyChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.offAnyChange( fn)
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
},{"./clerk-factory":3,"./dispatcher":5,"./facade":7,"./store-factory":10,"_process":13,"events":12}],10:[function(require,module,exports){
var alias= require('./alias'),
    type= require('elucidata-type')

function StoreFactory(runtime, name, builder) {
  var _handlers= {},
      instance= {},
      notificationEvent= runtime.createEvent( name, 'notify'),
      changeEvent= runtime.createEvent( name, 'change'),
      returnValue

  var manager= {

    waitFor:function( ) {for (var stores=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) stores.push(arguments[$__0]);
      return runtime.dispatcher.waitFor( stores);
    },

    hasChanged:function() {
      changeEvent.emitFlat( arguments)
    },

    notify:function( msg) {
      // sendNotification.emit( msg)
      notificationEvent.emit( msg)
    },

    deliver:function( methods) {
      Object.
        keys( methods).
        forEach(function( methodName){
          instance[ methodName]= methods[ methodName]
        })
    },

    handle:function(store, handlers) {
      if( arguments.length === 1) {
        handlers= store
        store= runtime.getInstance( 'facade', name)
      }
      var getEventName= function(actionName){
        return name +'_'+ actionName
      }

      Object.
        keys( handlers).
        forEach(function( actionName){
          var eventName= getEventName( actionName),
              fn= handlers[ actionName]
          _handlers[ eventName]= fn //.bind(handlers)
        })

    },

    createEvent:function(eventName) {
      var event= runtime.createEvent( name, eventName),
          emitterFn= event.emit.bind( event)

      this.deliver( event.public)
      this['emit'+ eventName.camelize( true)]= emitterFn

      return emitterFn
    },

    getClerk:function() {
      return runtime.getInstance('clerk', name)
    }
  }

  alias( manager, 'handle', 'handles')
  alias( manager, 'hasChanged', 'dataDidChange', 'dataHasChanged')
  alias( manager, 'deliver', 'delivers', 'provide', 'provides', 'public')

  manager.deliver( changeEvent.public)
  manager.deliver( notificationEvent.public)

  if( type.isFunction( builder)) {
    returnValue= builder(manager, manager.hasChanged, manager.waitFor, manager.notify)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.deliver( returnValue)
  }

  // TODO: Deprecate onDataChange and only support onChange
  alias( instance, 'onChange', 'onDataChange')
  alias( instance, 'offChange', 'offDataChange')

  instance.id= runtime.dispatcher.register(function( action){
    var handler;
    if( handler= _handlers[ action.type]) {  // jshint ignore:line
      handler( action)
    }
  })

  return instance;
}

module.exports= StoreFactory

},{"./alias":2,"elucidata-type":14}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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