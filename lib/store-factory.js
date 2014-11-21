var alias= require('./alias'),
    type= require('elucidata-type')

function StoreFactory(runtime, name, builder) {
  var _handlers= {},
      instance= {},
      notificationEvent= runtime.createEvent( name, 'notify'),
      changeEvent= runtime.createEvent( name, 'change'),
      returnValue

  var manager= {

    waitFor:function( ) {for (var stores=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) stores.push(arguments[$__0]);
      return runtime.dispatcher.waitFor( stores);
    },

    hasChanged:function() {
      changeEvent.emitFlat( arguments)
    },

    notify:function( msg) {
      // sendNotification.emit( msg)
      notificationEvent.emit( msg)
    },

    deliver:function( methods) {
      Object.
        keys( methods).
        forEach(function( methodName){
          instance[ methodName]= methods[ methodName]
        })
    },

    handle:function(store, handlers) {
      if( arguments.length === 1) {
        handlers= store
        store= runtime.getInstance( 'facade', name)
      }
      var getEventName= function(actionName){
        return name +'_'+ actionName
      }

      Object.
        keys( handlers).
        forEach(function( actionName){
          var eventName= getEventName( actionName),
              fn= handlers[ actionName]
          _handlers[ eventName]= fn //.bind(handlers)
        })

    },

    createEvent:function(eventName) {
      var event= runtime.createEvent( name, eventName),
          emitterFn= event.emit.bind( event)

      this.deliver( event.public)
      this['emit'+ eventName.camelize( true)]= emitterFn

      return emitterFn
    },

    getClerk:function() {
      return runtime.getInstance('clerk', name)
    }
  }

  alias( manager, 'handle', 'handles')
  alias( manager, 'hasChanged', 'dataDidChange', 'dataHasChanged')
  alias( manager, 'deliver', 'delivers', 'provide', 'provides', 'public')

  manager.deliver( changeEvent.public)
  manager.deliver( notificationEvent.public)

  if( type.isFunction( builder)) {
    returnValue= builder(manager, manager.hasChanged, manager.waitFor, manager.notify)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.deliver( returnValue)
  }

  // TODO: Deprecate onDataChange and only support onChange
  alias( instance, 'onChange', 'onDataChange')
  alias( instance, 'offChange', 'offDataChange')

  instance.id= runtime.dispatcher.register(function( action){
    var handler;
    if( handler= _handlers[ action.type]) {  // jshint ignore:line
      handler( action)
    }
  })

  return instance;
}

module.exports= StoreFactory
