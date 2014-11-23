var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    storeFactory= require( './factory'),
    uid= require( './uid')

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
      asyncDispatch: true,
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
    if( arguments.length === 1) {
      builder= name
      name= uid()
    }
    return this.$Runtime_buildFactory( name, '*', builder)
  };

  Runtime.prototype.defineStore=function(name, builder) {"use strict";
    return this.$Runtime_buildFactory( name, 'store', builder)
  };

  Runtime.prototype.defineClerk=function(name, builder) {"use strict";
    return this.$Runtime_buildFactory( name, 'clerk', builder)
  };

  Runtime.prototype.getInstance=function(name)  {"use strict";
    var instance= this.registry[ name]

    if( !instance && this.settings.verbose) {
      console.warn( "Storefront: Store", name, "is not defined.")
    }
    // Increase safety a bit -- don't wanna freeze it, per se.
    // else {
    //   instance= Object.create( instance)
    // }

    return instance
  };

  Runtime.prototype.getManager=function(name) {"use strict";
    // TODO
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

    if(! instance) {
      instance= {}
      this.registry[ name]= instance
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
