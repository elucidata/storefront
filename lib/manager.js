var merge= require( './merge'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
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

    bindAll( this,
      'dispatch', 'notify', 'action', 'handle', 'waitFor',
      'hasChanged', 'expose', 'getClerk', 'getStore', 'createEvent'
    )

    alias( this, 'actions', 'action', 'observe', 'observes')
    alias( this, 'getStore', 'get')
    alias( this, 'expose', 'exposes', 'outlet', 'outlets')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    // alias( this, 'handle', 'handles', 'observe', 'observes')
    // alias( this, 'expose', 'exposes', 'provide', 'provides')

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
    return this
  };

  Manager.prototype.invoke=function(cmd)  {"use strict";for (var params=[],$__0=1,$__1=arguments.length;$__0<$__1;$__0++) params.push(arguments[$__0]);
    return this.$Manager_instance[ cmd].apply( this.$Manager_instance, params)
  };

  Manager.prototype.notify=function(message) {"use strict";
    this.$Manager_notifyEvent.emit( message)
    return this
  };

  Manager.prototype.before=function(methods) {"use strict";
    var actionDispatchers= {}
    Object.keys( methods).forEach(function( actionName) {
      var eventName= this.name +'_'+ actionName,
          fn= methods[ actionName],
          boundDispatch= this.dispatch.bind( this, eventName)

      fn.displayName= eventName
      this.$Manager_instance[ actionName]= fn.bind( this.$Manager_instance, boundDispatch)
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

    Object.keys( methods).forEach(function( actionName){
      var eventName= store +'_'+ actionName,
          fn= methods[ actionName]
      this.$Manager_handlers[ eventName]= fn //.bind(this._instance)

      if( store == this.name && !this.$Manager_instance[ actionName]) {
        // Stub out an action...
        var stub= {}
        stub[ actionName]= function() {
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
    Object.keys( methods).forEach(function( methodName){
      if( this.$Manager_instance.hasOwnProperty( methodName)) {
        var method= this.$Manager_instance[ methodName]

        if(! method.$Manager_isStub) {
          var error= new Error( "Redefining property "+ methodName +" on store "+ this.name)
          error.framesToPop= 3
          throw error
        }
      }
      this.$Manager_instance[ methodName]= methods[ methodName]
    }.bind(this))
    return this
  };

  Manager.prototype.getClerk=function() {"use strict";
    return this.$Manager_instance
  };

  Manager.prototype.getStore=function(storeName) {"use strict";
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
