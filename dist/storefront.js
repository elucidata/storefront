!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Storefront=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Runtime= require( './lib/runtime')

// module.exports= Runtime.newInstance()
module.exports= new Runtime()

},{"./lib/runtime":13}],2:[function(require,module,exports){
module.exports=
function alias(/* target, prop, ...aliases */) {
  var aliases= Array.prototype.slice.call( arguments),
      target= aliases.shift(),
      prop= aliases.shift(),
      item= target[ prop]

  aliases.forEach(function( alias){
    target[ alias]= item
  })
}

},{}],3:[function(require,module,exports){
var kind= require( 'elucidata-type')

module.exports=
function bindAll(/* target, ...props */) {
  var props= Array.prototype.slice.call( arguments),
      target= props.shift()

  props.forEach(function( key){
    var prop= target[ key]
    if( prop && kind.isFunction( prop)) {
      target[ key]= prop.bind( target)
    }
  })

  return target
}

},{"elucidata-type":17}],4:[function(require,module,exports){
module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, function( _, char) {
    return char ? char.toUpperCase () : ''
  })
}

},{}],5:[function(require,module,exports){
(function (global){
// Based on: https://github.com/paulmillr/console-polyfill/blob/master/index.js
module.exports=
(function( con) {
  var prop, method,
      empty= {},
      dummy= function() {},
      properties= [
        'memory'
      ],
      methods= [
        'assert',
        'clear',
        'count',
        'debug',
        'dir',
        'dirxml',
        'error',
        'exception',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'markTimeline',
        'profile',
        'profiles',
        'profileEnd',
        'show',
        'table',
        'time',
        'timeEnd',
        'timeline',
        'timelineEnd',
        'timeStamp',
        'trace',
        'warn'
      ]

  while( prop= properties.pop()) {  // jshint ignore:line
    con[ prop]= con[ prop] || empty
  }

  while( method= methods.pop()) {  // jshint ignore:line
    con[ method]= con[ method] || dummy
  }

  return con

})( global.console= global.console || {})

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (process){
var camelize= require( './camelize'),
    flatten= require( './flatten')

module.exports=
function createEvent( baseName, eventName, emitter) {
  var event_key= baseName +':'+ eventName

  var eventApi= {

    name: event_key,

    public: {},

    emit: function() {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      process.nextTick(function(){
        emitter.emit.apply( emitter, params)
      })
    },

    emitNow: function() {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      emitter.emit.apply( emitter, params)
    },

    emitFlat: function() {
      var params= flatten( [ event_key].concat( Array.prototype.slice.call( arguments)))
      process.nextTick(function(){
        emitter.emit.apply( emitter, params)
      })
    }
  }

  eventApi.public[ 'on'+ camelize( eventName)]= function( fn) {
    emitter.on( event_key, fn)
  }

  eventApi.public[ 'off'+ camelize( eventName)]= function( fn) {
    emitter.removeListener( event_key, fn)
  }

  return eventApi
}

}).call(this,require('_process'))
},{"./camelize":4,"./flatten":9,"_process":16}],7:[function(require,module,exports){
var uid= require( './uid'),
    now= require( './now'),
    console= require( './console')  // jshint ignore:line

var THRESHOLD= 10, // In milliseconds
    _singleton_instance= null,
    _log_dispatches= false

module.exports=
(function(){

  function Dispatcher() {"use strict";
    this.active= false
    this.$Dispatcher_handlers= {}
    this.$Dispatcher_processed= {}
    this.$Dispatcher_tokenList= []
    this.$Dispatcher_queue= []
  }

  Dispatcher.prototype.register=function(handler, preferredToken) {"use strict";
    if( preferredToken && this.$Dispatcher_handlers.hasOwnProperty( preferredToken)) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this.$Dispatcher_handlers[token]= handler
    this.$Dispatcher_tokenList= Object.keys( this.$Dispatcher_handlers)
    return token
  };

  Dispatcher.prototype.deregister=function(token) {"use strict";
    var handler;
    if( handler= this.$Dispatcher_handlers[ token] )  // jshint ignore:line
        delete this.$Dispatcher_handlers[ token]
    return handler
  };

  Dispatcher.prototype.waitFor=function(tokens) {"use strict";
    if(! this.active) return this
    (tokens || []).forEach(function( token){
      // support waitFor params being store instances or store tokens:
      this.$Dispatcher_callHandler( token.token || token)
    }.bind(this))
    return this
  };

  Dispatcher.prototype.dispatch=function(action, callback) {"use strict";
    if( this.active ) {
      this.$Dispatcher_queue.push([ action, callback])
      return this
    }

    var length= this.$Dispatcher_tokenList.length,
        index= 0, start_time, duration, label

    if( _log_dispatches) {
      label= action.type;
      console.time( label)
      console.group( label)
    }

    if( length ) {
      start_time= now()
      this.active= true
      this.$Dispatcher_currentAction= action
      this.$Dispatcher_processed= {}

      while( index < length) {
          this.$Dispatcher_callHandler( this.$Dispatcher_tokenList[ index])
          index += 1
      }

      this.$Dispatcher_currentAction= null
      this.active= false

      duration= now() - start_time

      if( duration > THRESHOLD) {
        console.info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
        // global[ 'console'].info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( _log_dispatches) {
      console.groupEnd( label)
      console.timeEnd( label)
    }

    if( callback) {
      callback() // Should the callback be sent anything?
    }

    if( this.$Dispatcher_queue.length) {
      // Should this happen on the nextTick?
      var $__0=  this.$Dispatcher_queue.shift(),nextAction=$__0[0],nextCallback=$__0[1]
      this.dispatch( nextAction, nextCallback)
    }

    return this
  };

  Dispatcher.prototype.$Dispatcher_callHandler=function(token) {"use strict";
    if( this.$Dispatcher_processed[ token] === true || !this.active) return
    var handler= this.$Dispatcher_handlers[ token]

    handler.call( this, this.$Dispatcher_currentAction, this, token)
    this.$Dispatcher_processed[ token]= true
  };

  Dispatcher.getInstance=function() {"use strict";
    if( _singleton_instance === null) {
      _singleton_instance= new this()
    }
    return _singleton_instance
  };

  Dispatcher.enableLogging=function(enabled) {"use strict";
    _log_dispatches= enabled
  };
return Dispatcher;})()

},{"./console":5,"./now":12,"./uid":14}],8:[function(require,module,exports){
var camelize= require( './camelize')

module.exports=
function eventHelperMixin( runtime) {
  return {
    onStoreEvent:function( storeName, eventName, callback) {
      storeName= storeName.name || storeName // in case they send a store instance

      var store= runtime.getInstance( storeName), hookup

      if( store) {
        eventName= camelize( eventName)

        if( hookup= store[ 'on'+ eventName]) {  // jshint ignore:line
          hookup( callback)

          if(! this._storeListeners) {
            this._storeListeners= []
          }

          this._storeListeners.push({ storeName:storeName, eventName:eventName, callback:callback })
        }
        else {
          if( runtime.settings.verbose) {
            console.warn( "Storefront: Event", eventName, "isn't supported by store:", storeName)
          }
        }
      }
    },

    componentWillUnmount:function() {
      if( this._storeListeners) {

        this._storeListeners.forEach(function( eventInfo) {
          var $__0=   eventInfo,storeName=$__0.storeName,eventName=$__0.eventName,callback=$__0.callback,
              store= runtime.getInstance( storeName)
          store[ 'off'+ eventName]( callback )
        })

        this._storeListeners.length= 0
        this._storeListeners= null
      }
    }
  }
}

},{"./camelize":4}],9:[function(require,module,exports){
module.exports=
function flatten( arrays) {
  var merged= []
  
  return merged.concat.apply( merged, arrays)
}

},{}],10:[function(require,module,exports){
(function (process){
var merge= require( './merge'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
    camelize= require( './camelize'),
    kind= require( 'elucidata-type')

module.exports=
(function(){

  function Manager(runtime, name, instance) {"use strict";
    this.runtime= runtime
    this.name= name

    this.$Manager_instance= instance
    this.$Manager_handlers= {}
    this.$Manager_notifyEvent= runtime.createEvent( name, 'notify')
    this.$Manager_changeEvent= runtime.createEvent( name, 'change')

    this.expose( this.$Manager_notifyEvent.public)
    this.expose( this.$Manager_changeEvent.public)

    bindAll( this,
      'dispatch', 'notify', 'actions', 'waitFor', 'hasChanged', 'before',
      'expose', 'getClerk', 'getStore', 'createEvent', 'invoke'
    )

    alias( this, 'actions', 'action', 'observe', 'observes')
    alias( this, 'get', 'getStore', 'getClerk')
    alias( this, 'expose', 'exposes', 'outlet', 'outlets')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    if( instance.token == null) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register(function( action){
        var handler
        if( handler= this.$Manager_handlers[ action.type]) {  // jshint ignore:line
          handler( action)
        }
      }.bind(this))
    }
  }

  Manager.prototype.dispatch=function(type, payload, callback) {"use strict";
    if( this.runtime.settings.aysncDispatch) {
      process.nextTick(function(){
        this.runtime.dispatcher.dispatch(
          { origin: this.name, type:type, payload:payload },
          callback
        )
      }.bind(this))
    }
    else {
      this.runtime.dispatcher.dispatch(
        { origin: this.name, type:type, payload:payload },
        callback
      )
    }
    return this
  };

  Manager.prototype.invoke=function(cmd)  {"use strict";for (var params=[],$__0=1,$__1=arguments.length;$__0<$__1;$__0++) params.push(arguments[$__0]);
    var fn= this.$Manager_instance[ cmd]
    if( kind.isFunction( fn)) {
      return fn.apply( this.$Manager_instance, params)
    }
    else {
      throw new Error( "Method "+ cmd +" not found!")
    }
  };

  Manager.prototype.notify=function(message) {"use strict";
    this.$Manager_notifyEvent.emit( message)
    return this
  };

  Manager.prototype.before=function(methods) {"use strict";
    Object.keys( methods).forEach(function( action_name) {
      var event_name= this.name +'_'+ action_name,
          fn= methods[ action_name],
          bound_dispatch= this.dispatch.bind( this, event_name)

      fn.displayName= event_name
      this.$Manager_instance[ action_name]= fn.bind( this.$Manager_instance, bound_dispatch)
    }.bind(this))
    return this
  };

  Manager.prototype.actions=function(store, methods) {"use strict";
    if( arguments.length === 1) {
      methods= store
      store= this.name
    }
    else if( kind.isObject( store)) {
      store= store.name
    }

    Object.keys( methods).forEach(function( action_name){
      var event_name= store +'_'+ action_name,
          fn= methods[ action_name]

      this.$Manager_handlers[ event_name]= fn //.bind(this._instance)

      if( store == this.name && !this.$Manager_instance[ action_name]) {
        // Stub out an action...
        var stub= {}
        stub[ action_name]= function() {
          var args= Array.prototype.slice.call( arguments),
              dispatch= args.shift()
          if( args.length === 1) {
            dispatch( args[ 0])
          }
          else {
            dispatch( args)
          }
        }
        this.before( stub)
      }
    }.bind(this))
    return this
  };

  Manager.prototype.waitFor=function()  {"use strict";for (var stores=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) stores.push(arguments[$__0]);
    stores= stores.map(function( store) {
      if( kind.isString( store)) {
        return this.runtime.get( store)
      }
      else {
        return store
      }
    }.bind(this))
    this.runtime.dispatcher.waitFor( stores)
    return this
  };

  Manager.prototype.hasChanged=function() {"use strict";
    this.$Manager_changeEvent.emitFlat( arguments)
    return this
  };

  Manager.prototype.expose=function(methods) {"use strict";
    Object.keys( methods).forEach(function( method_name){
      if( this.$Manager_instance.hasOwnProperty( method_name)) {
        var method= this.$Manager_instance[ method_name]

        if(! method.$Manager_isStub) {
          var error= new Error( "Redefining property "+ method_name +" on store "+ this.name)
          error.framesToPop= 3
          throw error
        }
      }
      this.$Manager_instance[ method_name]= methods[ method_name]
    }.bind(this))
    return this
  };

  Manager.prototype.get=function(storeName) {"use strict";
    if( storeName ) {
      return this.runtime.get( storeName, true )
    }
    else {
      return this.$Manager_instance
    }
  };

  Manager.prototype.createEvent=function(eventName) {"use strict";
    var event= this.runtime.createEvent( name, eventName),
        emitterFn= event.emit.bind( event)

    this.expose( event.public)
    this.$Manager_instance[ 'emit'+ camelize( eventName)]= emitterFn

    return emitterFn
  };

  // You shouldn't call this yourself... The runtime will if a resetStore call
  // is made -- usually only in testing!
  Manager.prototype.resetInternals=function() {"use strict";
    this.$Manager_handlers= {}

    if( this.$Manager_instance.token) {
      this.runtime.dispatcher.deregister( this.$Manager_instance.token)
    }

    Object.keys( this.$Manager_instance).forEach(function( key){
      if( key !== 'name') {
        delete this.$Manager_instance[ key]
      }
    }.bind(this))
  };
return Manager;})()

}).call(this,require('_process'))
},{"./alias":2,"./bind-all":3,"./camelize":4,"./merge":11,"_process":16,"elucidata-type":17}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
(function (process,global){
var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid'),
    alias= require( './alias'),
    console= require( './console'),  // jshint ignore:line
    bindAll= require( './bind-all'),
    createEvent= require( './create-event'),
    eventHelperMixin= require( './event-helper-mixin')



  function Runtime(settings) {"use strict";
    this.$Runtime_emitter= new EventEmitter()
    this.$Runtime_registry= {}
    this.$Runtime_managers= {}
    this.$Runtime_builders= []
    this.$Runtime_events= {}
    this.$Runtime_anyChangeEvent= this.createEvent('*', 'any-change')
    this.$Runtime_dataChanges= []
    this.$Runtime_timer= false

    this.configure( settings)

    if( this.settings.singletonDispatcher) {
      this.dispatcher= Dispatcher.getInstance()
    }
    else {
      this.dispatcher= new Dispatcher()
    }

    this.mixins={
      eventHelper: eventHelperMixin( this)
    }

    alias( this, 'get', 'getInstance')
  }

  Runtime.prototype.configure=function(settings) {"use strict";
    // Default config settings
    this.settings= merge({
      asyncDispatch: true,
      freezeInstance: false,
      useRAF: true,
      verbose: false,
      logging: false,
      singletonDispatcher: false
    }, settings || {})
    Dispatcher.enableLogging( this.settings.logging)
    return this
  };

  Runtime.prototype.newInstance=function(settings) {"use strict";
    return new Runtime( settings || this.settings)
  };

  Runtime.prototype.createEvent=function(storeName, eventName) {"use strict";
    var event= createEvent( storeName, eventName, this.$Runtime_emitter)

    if(! this.$Runtime_events[ event.name]) {
      this.$Runtime_events[ event.name]= event
    }

    return this.$Runtime_events[ event.name]
  };

  Runtime.prototype.knownEvents=function() {"use strict";
    return Object.keys( this.$Runtime_events)
  };

  Runtime.prototype.define=function(name, builder) {"use strict";
    if( kind.isUndefined( builder) ) { //arguments.length === 1) {
      builder= name
      name= uid()
    }
    return this.$Runtime_buildFactory( name, builder)
  };

  Runtime.prototype.get=function(name, stubMissing) {"use strict";
    var instance= this.$Runtime_registry[ name]

    if( !instance) {
      this.$Runtime_warn( "Store", name, "is not defined.")
      if( stubMissing === true) {
        this.$Runtime_info( "Building stub for", name)
        instance= { name:name }
        this.$Runtime_registry[ name]= instance
      }
    }

    return instance
  };

  Runtime.prototype.getManager=function(name) {"use strict";
    return this.$Runtime_managers[ name]
  };

  Runtime.prototype.hasStore=function(name) {"use strict";
    return this.$Runtime_registry.hasOwnProperty( name)
  };

  Runtime.prototype.onChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.onAnyChange( fn)
    return this
  };

  Runtime.prototype.offChange=function(fn) {"use strict";
    this.$Runtime_anyChangeEvent.public.offAnyChange( fn)
    return this
  };

  Runtime.prototype.size=function() {"use strict";
    return this.storeNames().length
  };

  Runtime.prototype.storeNames=function() {"use strict";
    return Object.keys( this.$Runtime_registry)
  };

  Runtime.prototype.recreateStore=function(name) {"use strict";
    var manager= this.getManager( name)

    if( manager) {
      manager.resetInternals()
    }

    this.$Runtime_builders
      .filter(function( def){
        return def.name === name
      })
      .forEach(function( info){
        this.$Runtime_buildFactory( info.name, info.builder, false)
      }.bind(this))

    return this.get( name)
  };

  Runtime.prototype.$Runtime_buildFactory=function(name, builder, saveBuilder) {"use strict";
    var instance= this.$Runtime_registry[ name],
        manager= this.$Runtime_managers[ name],
        return_value

    if( instance) {
      this.$Runtime_warn( name, "already defined: Merging definitions.")
    }

    if(! instance) {
      instance= { name:name }
      this.$Runtime_registry[ name]= instance
    }
    if(! manager) {
      manager= new Manager( this, name, instance)
      this.$Runtime_managers[ name]= manager
      this.$Runtime_trackChangeFor( name)
    }

    if( kind.isFunction( builder)) {
      return_value= builder( manager)
    }
    else if( kind.isObject( builder)) {
      return_value= builder
    }
    else {
      throw new Error( "Wrong builder type: Must provide a builder function or object.")
    }

    if( kind.isObject( return_value)) {
      manager.expose( return_value)
    }

    if( this.settings.freezeInstance === true) {
      Object.freeze( instance)
    }

    if( saveBuilder !== false) {
      this.$Runtime_builders.push({ name:name, builder:builder, manager:manager })
    }

    return this.get( name)
  };

  Runtime.prototype.$Runtime_trackChangeFor=function(name) {"use strict";
    var event_name= name +':change'
    this.$Runtime_emitter.on( event_name, function(){
      this.$Runtime_dataChanges.push({ type:event_name, params:Array.prototype.slice.call(arguments)})

      if(! this.$Runtime_timer) {
        if( this.settings.useRAF && global.requestAnimationFrame) {
          requestAnimationFrame( this.$Runtime_relayDataChanges.bind( this))
        }
        else {
          process.nextTick( this.$Runtime_relayDataChanges.bind( this))
        }
        this.$Runtime_timer= true
      }
    }.bind(this))
  };

  Runtime.prototype.$Runtime_stopTrackingChangesFor=function(name) {"use strict";
    var event_name= name +':change'
    this.$Runtime_emitter.removeListener( event_name)
  };

  Runtime.prototype.$Runtime_relayDataChanges=function() {"use strict";
    if( this.$Runtime_dataChanges.length) {
      this.$Runtime_anyChangeEvent.emitNow( this.$Runtime_dataChanges)
      this.$Runtime_dataChanges= []
    }
    this.$Runtime_timer= false
  };

  Runtime.prototype.$Runtime_warn=function() {"use strict";
    if( this.settings.verbose) {
      console.warn.apply( console, arguments)
    }
  };
  Runtime.prototype.$Runtime_info=function() {"use strict";
    if( this.settings.verbose) {
      console.info.apply( console, arguments)
    }
  };



module.exports= Runtime

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./alias":2,"./bind-all":3,"./camelize":4,"./console":5,"./create-event":6,"./dispatcher":7,"./event-helper-mixin":8,"./flatten":9,"./manager":10,"./merge":11,"./uid":14,"_process":16,"elucidata-type":17,"events":15}],14:[function(require,module,exports){
var _last_id = 0

function uid ( radix){
  var now = Math.floor( (new Date()).getTime() / 1000 )
  radix= radix || 36

  while ( now <= _last_id ) {
    now += 1
  }

  _last_id= now

  return now.toString( radix)
}

module.exports= uid

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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