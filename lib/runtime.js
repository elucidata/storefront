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
