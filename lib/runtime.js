var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid'),
    alias= require( './alias')

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){Runtime[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;Runtime.prototype=Object.create(____SuperProtoOfEventEmitter);Runtime.prototype.constructor=Runtime;Runtime.__superConstructor__=EventEmitter;

  function Runtime() {"use strict";
    EventEmitter.call(this)
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {}
    this.managers= {}
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
      asyncDispatch: true,
      freezeInstance: false,
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

  Runtime.prototype.defineStore=function(name, builder) {"use strict";
    if( kind.isUndefined( builder) ) { //arguments.length === 1) {
      builder= name
      name= uid()
    }
    return this.$Runtime_buildFactory( name, builder)
  };

  Runtime.prototype.getInstance=function(name, stubMissing) {"use strict";
    var instance= this.registry[ name]

    if( !instance) {
      if( this.settings.verbose)  {
        console.warn( "Storefront: Store", name, "is not defined.")
      }
      if( stubMissing === true) {
        if( this.settings.verbose)  {
          console.info( "Building stub for ", name)
        }
        instance= { name:name }
        this.registry[ name]= instance
      }
    }
    // else {
    //   // Increase safety a bit? -- don't wanna freeze it, per se.
    //   instance= Object.create( instance)
    // }

    return instance
  };

  Runtime.prototype.getManager=function(name) {"use strict";
    return this.managers[ name]
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
    var manager= this.getManager( name)

    if( manager) {
      manager.resetInternals()
    }

    this.builders
      .filter(function( def){
        return def.name === name
      })
      .forEach(function( info){
        this.$Runtime_buildFactory( info.name, info.builder, false)
      }.bind(this))

    return this.getInstance( name)
  };

  Runtime.prototype.$Runtime_buildFactory=function(name, builder, saveBuilder) {"use strict";
    var instance= this.registry[ name],
        manager= this.managers[ name],
        returnValue

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
    }

    if(! instance) {
      instance= { name:name }
      this.registry[ name]= instance
    }
    if(! manager) {
      manager= new Manager( this, name, instance)
      this.managers[ name]= manager
    }

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
      manager.expose( returnValue)
    }

    if( this.settings.freezeInstance === true) {
      Object.freeze( instance)
    }

    if( saveBuilder !== false) {
      this.builders.push({ name:name, builder:builder, manager:manager })
    }

    return this.getInstance( name)
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

  Runtime.newInstance=function() {"use strict";
    var runtime= new Runtime()
    var api= {
      define: runtime.defineStore.bind( runtime),
      get: runtime.getInstance.bind( runtime),
      configure: runtime.configure.bind( runtime),
      onChange: runtime.onAnyChange.bind( runtime),
      offChange: runtime.offAnyChange.bind( runtime),
      mixins: {
        eventHelper: require( './event-helper-mixin')( runtime)
      },
      newInstance: Runtime.newInstance,
      '_internals': runtime
    }
    // DEPRECATED: Remove in a future version...
    alias( api, 'define', 'defineStore', 'Store', 'defineClerk', 'Clerk')
    return api
  };


// Runtime API
module.exports= Runtime
