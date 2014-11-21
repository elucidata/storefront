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
