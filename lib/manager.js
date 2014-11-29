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
