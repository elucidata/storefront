var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
    createEvent= require( './create-event'),
    eventHelperMixin= require( './event-helper-mixin')

for(var EventEmitter____Key in EventEmitter){if(EventEmitter.hasOwnProperty(EventEmitter____Key)){Runtime[EventEmitter____Key]=EventEmitter[EventEmitter____Key];}}var ____SuperProtoOfEventEmitter=EventEmitter===null?null:EventEmitter.prototype;Runtime.prototype=Object.create(____SuperProtoOfEventEmitter);Runtime.prototype.constructor=Runtime;Runtime.__superConstructor__=EventEmitter;

  function Runtime(settings) {"use strict";
    EventEmitter.call(this)
    this.configure( settings)

    this.$Runtime_registry= {}
    this.$Runtime_managers= {}
    this.$Runtime_builders= []
    this.$Runtime_events= {}
    this.$Runtime_anyChangeEvent= this.createEvent('*', 'any-change')
    this.$Runtime_dataChanges= []
    this.$Runtime_timer= false

    if( this.settings.singletonDispatcher) {
      this.dispatcher= Dispatcher.getInstance()
    }
    else {
      this.dispatcher= new Dispatcher()
    }

    this.mixins={
      eventHelper: eventHelperMixin( this)
    }

    // DEPRECATED: Remove in a future version...
    alias( this, 'define', 'defineStore', 'Store', 'defineClerk', 'Clerk')
    alias( this, 'get', 'getInstance')
    alias( this, 'onChange', 'onAnyChange')
    alias( this, 'offChange', 'offAnyChange')
  }

  Runtime.prototype.configure=function(settings) {"use strict";
    // Default config settings
    this.settings= merge({
      asyncDispatch: true,
      freezeInstance: false,
      useRAF: true,
      verbose: false,
      singletonDispatcher: false
    }, settings || {})
    return this
  };

  Runtime.prototype.newInstance=function() {"use strict";
    return new Runtime( this.settings)
  };

  Runtime.prototype.createEvent=function(storeName, eventName) {"use strict";
    var event= createEvent( storeName, eventName, this)

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
      if( this.settings.verbose)  {
        console.warn( "Storefront: Store", name, "is not defined.")
      }
      if( stubMissing === true) {
        if( this.settings.verbose)  {
          console.info( "Building stub for ", name)
        }
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

    return this.getInstance( name)
  };

  Runtime.prototype.$Runtime_buildFactory=function(name, builder, saveBuilder) {"use strict";
    var instance= this.$Runtime_registry[ name],
        manager= this.$Runtime_managers[ name],
        returnValue

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
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
      this.$Runtime_builders.push({ name:name, builder:builder, manager:manager })
    }

    return this.getInstance( name)
  };

  Runtime.prototype.$Runtime_trackChangeFor=function(name) {"use strict";
    var eventName= name +':change'
    this.on( eventName, function(){
      this.$Runtime_dataChanges.push({ type:eventName, params:Array.prototype.slice.call(arguments)})

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

  Runtime.prototype.$Runtime_relayDataChanges=function() {"use strict";
    if( this.$Runtime_dataChanges.length) {
      this.$Runtime_anyChangeEvent.emitNow( this.$Runtime_dataChanges)
      this.$Runtime_dataChanges= []
    }
    this.$Runtime_timer= false
  };



// Runtime API
module.exports= Runtime
