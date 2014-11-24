var merge= require( './merge'),
    alias= require( './alias'),
    camelize= require( './camelize'),
    kind= require( 'elucidata-type')

module.exports= (function(){

  function Manager(runtime, name, instance) {"use strict";
    this.runtime= runtime
    this.name= name

    this.$Manager_instance= instance
    this.$Manager_handlers= {}
    this.$Manager_notifyEvent= runtime.createEvent( name, 'notify')
    this.$Manager_changeEvent= runtime.createEvent( name, 'change')

    this.expose( this.$Manager_notifyEvent.public)
    this.expose( this.$Manager_changeEvent.public)

    alias( this, 'action', 'actions')
    alias( this, 'handle', 'handles', 'observe', 'observes')
    alias( this, 'expose', 'exposes', 'provide', 'provides')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    if( instance.token == null) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register(function( action){
        var handler;
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
  };

  Manager.prototype.notify=function(message) {"use strict";
    this.$Manager_notifyEvent.emit( message)
  };

  Manager.prototype.action=function(methods) {"use strict";
    Object.keys( methods).forEach(function( actionName) {
      var eventName= this.name +'_'+ actionName,
          fn= methods[ actionName],
          boundDispatch= this.dispatch.bind( this, eventName)

      fn.displayName= eventName

      this.$Manager_instance[ actionName]= fn.bind( this.$Manager_instance, boundDispatch)
    }.bind(this))
  };

  Manager.prototype.handle=function(store, methods) {"use strict";
    if( arguments.length === 1) {
      methods= store
      store= this.name
    }
    else if( kind.isObject( store)) {
      store= store.name
    }

    Object.keys( methods).forEach(function( actionName){
      var eventName= store +'_'+ actionName,
          fn= methods[ actionName]
      this.$Manager_handlers[ eventName]= fn //.bind(handlers)
    }.bind(this))
  };

  Manager.prototype.waitFor=function()  {"use strict";for (var stores=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) stores.push(arguments[$__0]);
    stores= stores.map(function( store) {
      if( kind.isString( store)) {
        return this.runtime.getInstance( store)
      }
      else {
        return store
      }
    }.bind(this))
    this.runtime.dispatcher.waitFor( stores)
  };

  Manager.prototype.hasChanged=function() {"use strict";
    this.$Manager_changeEvent.emitFlat( arguments)
  };

  Manager.prototype.expose=function(methods) {"use strict";
    Object.keys( methods).forEach(function( methodName){
      if( this.$Manager_instance.hasOwnProperty( methodName)) {
        var error= new Error( "Redefining property "+ methodName +" on store "+ this.name)
        error.framesToPop= 3
        throw error
      }
      this.$Manager_instance[ methodName]= methods[ methodName]
    }.bind(this))
  };

  Manager.prototype.getClerk=function() {"use strict";
    return this.$Manager_instance
  };

  Manager.prototype.getStore=function(storeName) {"use strict";
    if( storeName ) {
      return this.runtime.getInstance( storeName, true )
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
