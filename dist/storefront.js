!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Storefront=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Runtime= require( './lib/runtime')

// module.exports= Runtime.newInstance()
module.exports= new Runtime()

},{"./lib/runtime":15}],2:[function(require,module,exports){
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

},{"elucidata-type":19}],4:[function(require,module,exports){
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
    if(! con[ prop]) {
      con[ prop]= con[ prop] || empty
    }
  }

  while( method= methods.pop()) {  // jshint ignore:line
    if(! con[ method]) {
      con[ method]= con[ method] || dummy
    }
  }

  return con

})( global.console= global.console || {})

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (process){
var camelize= require( './camelize'),
    flatten= require( './flatten')

module.exports=
function createEvent( baseName, eventName, emitter, options) {
  var event_key= baseName +':'+ eventName

  options= options || {}

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
      emitter.emit.apply( emitter, params)
      // process.nextTick(()=>{
      //   emitter.emit.apply( emitter, params)
      // })
    }
  }

  eventApi.public[ 'on'+ camelize( eventName)]= function( fn) {
    emitter.on( event_key, fn)
    return function unsubscribeToChanges() {
      emitter.removeListener( event_key, fn)
    }
  }

  eventApi.public[ 'off'+ camelize( eventName)]= function( fn) {
    emitter.removeListener( event_key, fn)
  }

  return eventApi
}

}).call(this,require('_process'))
},{"./camelize":4,"./flatten":11,"_process":18}],7:[function(require,module,exports){
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

},{"./console":5,"./now":14,"./uid":17}],8:[function(require,module,exports){
function ensure( condition, format, a, b, c, d, e, f) {
  if(! condition) {
    var error, args, args_index

    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      )
    }
    else {
      args= [a, b, c, d, e, f]
      args_index= 0

      error= new Error(
        'Violation: ' +
        format.replace( /%s/g, function(){ return args[ args_index++]})
      )
    }

    error.framesToPop= 1 // we don't care about ensure's own frame
    throw error
  }
}

module.exports= ensure

},{}],9:[function(require,module,exports){
var camelize= require( './camelize'),
    subscriptions= require( './subscriptions')

module.exports=
function eventHelperMixin( runtime) {
  var _subscriber= subscriptions( runtime)

  return {
    onStoreEvent:function( storeName, eventName, callback) {
      if(! this._storefront_subscriptions) {
        this._storefront_subscriptions= _subscriber()
      }
      this._storefront_subscriptions.on( storeName, eventName, callback)
    },
    componentWillUnmount:function() {
      if( this._storefront_subscriptions) {
        this._storefront_subscriptions.release()
        this._storefront_subscriptions= null
      }
    }
  }
}

},{"./camelize":4,"./subscriptions":16}],10:[function(require,module,exports){
var kind= require( 'elucidata-type')

module.exports=
function extractMethods( source, allowNonMethods ) {
  var results= {}
  if( kind.isFunction( source )) {
    source= getInlineMethods( source)
  }
  for( var name in source) {
    var prop= source[ name]
    if( allowNonMethods === true ) {
      results[ name]= prop
    }
    else {
      if( kind.isFunction( prop )) {
        results[ name]= prop
      }
    }
  }
  return results
}


function getInlineMethods( source ) {
  if(!('getOwnPropertyNames' in Object)) { // Probably mobile?
    return source.prototype // this should work, needs more testing
  }
  var instance= new source(), methods= {}
  Object.getOwnPropertyNames( source.prototype).forEach(function( name)  {
    if( name !== 'constructor') {
      methods[ name]= source.prototype[ name]
    }
  })
  return methods
}

},{"elucidata-type":19}],11:[function(require,module,exports){
module.exports=
function flatten( arrays) {
  var merged= []
  
  return merged.concat.apply( merged, arrays)
}

},{}],12:[function(require,module,exports){
(function (process){
var merge= require( './merge'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
    camelize= require( './camelize'),
    extractMethods= require( './extract-methods'),
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
    this.expose({
      listen: this.$Manager_changeEvent.public.onChange,
      unlisten: this.$Manager_changeEvent.public.offChange
    })

    bindAll( this,
      'dispatch', 'notify', 'actions', 'waitFor', 'hasChanged', 'before',
      'expose', 'get', 'before', 'createEvent', 'invoke'
    )

    alias( this, 'actions', 'action', 'observe', 'observes')
    alias( this, 'get', 'getStore', 'getClerk')
    alias( this, 'expose', 'exposes', 'outlet', 'outlets')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    if( instance.token == null) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register( function(action)  {
        var handler
        if( handler= this.$Manager_handlers[ action.type]) {  // jshint ignore:line
          handler( action)
        }
      }.bind(this))
    }
  }

  Manager.prototype.dispatch=function(type, payload, callback) {"use strict";
    if( this.runtime.settings.aysncDispatch ) {
      process.nextTick(function()  {
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
    this.$Manager_notifyEvent.emitNow( message)
    return this
  };

  Manager.prototype.before=function(methods) {"use strict";
    methods= extractMethods( methods)
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
    methods= extractMethods( methods)
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

  Manager.prototype.expose=function(methods, allowNonMethods) {"use strict";
    methods= extractMethods( methods, allowNonMethods )

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

  Manager.prototype.createEvent=function(eventName, options) {"use strict";
    options= options || {}
    var event= this.runtime.createEvent( name, eventName, options),
        emitterFn= options.async ? event.emit.bind( event) : event.emitNow.bind( event)

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
},{"./alias":2,"./bind-all":3,"./camelize":4,"./extract-methods":10,"./merge":13,"_process":18,"elucidata-type":19}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
(function (process,global){
var Dispatcher= require( './dispatcher'),
    // EventEmitter= require( 'events').EventEmitter,
    EventEmitter= require('eventemitter3'),
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    ensure= require( './ensure'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid'),
    alias= require( './alias'),
    now= require( './now'),
    console= require( './console'),  // jshint ignore:line
    bindAll= require( './bind-all'),
    createEvent= require( './create-event'),
    eventHelperMixin= require( './event-helper-mixin'),
    subscriptions= require( './subscriptions'),
    pkg= require( '../package.json')



  function Runtime(settings) {"use strict";
    this.$Runtime_emitter= new EventEmitter()
    this.$Runtime_emitter.setMaxListeners( 0) // Unlimited event listeners! ? !
    this.$Runtime_registry= {}
    this.$Runtime_managers= {}
    this.$Runtime_builders= []
    this.$Runtime_events= {}
    this.$Runtime_anyChangeEvent= this.createEvent('*', 'any-change')
    this.$Runtime_dataChanges= []
    this.$Runtime_timer= false
    this.version= pkg.version

    this.configure( settings)

    if( this.settings.singletonDispatcher) {
      this.dispatcher= Dispatcher.getInstance()
    }
    else {
      this.dispatcher= new Dispatcher()
    }

    this.util={
      eventHelperMixin: eventHelperMixin( this),
      subscriptions: subscriptions( this),
      ensure:ensure,
      kind:kind,
      camelize:camelize,
      merge:merge,
      flatten:flatten,
      uid:uid,
      alias:alias,
      bindAll:bindAll,
      now:now
    }

    // DEPRECATED:
    this.mixins={
      eventHelper: eventHelperMixin( this),
      subscriptions: subscriptions( this)
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

  Runtime.prototype.createEvent=function(storeName, eventName, options) {"use strict";
    var event= createEvent( storeName, eventName, this.$Runtime_emitter, options)

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
      this.$Runtime_warn( "Storefront: Store", name, "is not defined.")
      if( stubMissing === true) {
        this.$Runtime_info( "Storefront: Building stub for", name)
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

  Runtime.prototype.allStores=function() {"use strict";
    var all= {}
    Object.keys( this.$Runtime_registry).forEach( function(name)  {
      all[ name]= this.$Runtime_registry[ name]
    }.bind(this))
    return all
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
      this.$Runtime_warn( 'Storefront:', name, "already defined: Merging definitions.")
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
      manager.expose( return_value, true)
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
},{"../package.json":21,"./alias":2,"./bind-all":3,"./camelize":4,"./console":5,"./create-event":6,"./dispatcher":7,"./ensure":8,"./event-helper-mixin":9,"./flatten":11,"./manager":12,"./merge":13,"./now":14,"./subscriptions":16,"./uid":17,"_process":18,"elucidata-type":19,"eventemitter3":20}],16:[function(require,module,exports){
var camelize= require( './camelize'),
    alias= require( './alias')



  function Subscriptions(runtime) {"use strict";
    this.$Subscriptions_runtime= runtime
    this.$Subscriptions_storeListeners= []
    alias( this, 'on', 'onStoreEvent', 'onEvent')
    alias( this, 'release', 'off', 'releaseAll')
  }

  Subscriptions.prototype.size=function() {"use strict";
    return this.$Subscriptions_storeListeners.length
  };

  Subscriptions.prototype.on=function(storeName, eventName, callback)  {"use strict";
    storeName= storeName.name || storeName // in case they send a store instance
    var store= this.$Subscriptions_runtime.getInstance( storeName), hookup

    if( store) {
      eventName= camelize( eventName)


      if( hookup= store[ 'on'+ eventName]) {  // jshint ignore:line
        var disconnector= hookup( callback)

        //this._storeListeners.push({ storeName, eventName, callback })
        this.$Subscriptions_storeListeners.push( disconnector )
      }
      else {
        if( this.$Subscriptions_runtime.settings.verbose) {
          console.warn( "Storefront: Event", eventName, "isn't supported by store:", storeName)
        }
      }
    }
    else {
      if( this.$Subscriptions_runtime.settings.verbose) {
        console.warn( "Storefront: Store", storeName, "not found")
      }
    }
    return this
  };

  Subscriptions.prototype.release=function() {"use strict";
    this.$Subscriptions_storeListeners.forEach( function(disconnect)  {return disconnect();} )
    // this._storeListeners.forEach(( eventInfo)=> {
    //   var {storeName, eventName, callback}= eventInfo,
    //       store= this._runtime.getInstance( storeName)

    //   store[ 'off'+ eventName]( callback )
    // })

    this.$Subscriptions_storeListeners.length= 0
    this.$Subscriptions_storeListeners= []
    return this
  };



module.exports=
function subscriptions( runtime) {
  return function() {
    return new Subscriptions( runtime )
  }
}

},{"./alias":2,"./camelize":4}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
module.exports={
  "name": "storefront",
  "description": "Less tedious Flux implementation.",
  "main": "index.js",
  "version": "0.7.1",
  "license": "MIT",
  "author": "Matt McCray <matt@elucidata.net>",
  "keywords": [
    "react",
    "flux"
  ],
  "homepage": "https://github.com/elucidata/storefront",
  "bugs": {
    "url": "https://github.com/elucidata/storefront/issues"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/elucidata/storefront.git"
  },
  "scripts": {
    "build": "jsx --harmony --no-cache-dir src/ lib/",
    "watch": "jsx -w --harmony --no-cache-dir src/ lib/",
    "compile": "NODE_ENV=production browserify index.js -o dist/storefront.js --standalone Storefront",
    "dist": "npm run build; npm run compile; npm run minify; npm run gz-size",
    "minify": "cat dist/storefront.js | uglifyjs -m -c > dist/storefront.min.js",
    "inc-major": "mversion major",
    "inc-minor": "mversion minor",
    "inc-patch": "mversion patch",
    "toc": "toc docs/",
    "gz-size": "gzip -c dist/storefront.min.js | wc -c | pretty-bytes",
    "test": "tape test/**/*.js | tap-spec",
    "test_b": "babel-tape-runner test/**/*-test.js | tap-spec"
  },
  "dependencies": {
    "elucidata-type": "^1.1.1",
    "eventemitter3": "^1.1.0"
  },
  "devDependencies": {
    "react-tools": "^0.12.1",
    "tape": "^3.0.3",
    "tap-spec": "^2.1.0",
    "mversion": "^1.8.0",
    "uglifyjs": "^2.3.6",
    "browserify": "^6.3.2",
    "envify": "^3.2.0",
    "babel": "^5.4.3",
    "babel-tape-runner": "^1.1.0"
  }
}

},{}]},{},[1])(1)
});