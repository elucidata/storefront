var alias= require('./alias'),
    type= require('elucidata-type')

function StoreFactory(runtime, name, builder) {
  var _handlers= {},
      instance= {},
      notificationEvent= runtime.createEvent( name, 'notify'),
      changeEvent= runtime.createEvent( name, 'change'),
      returnValue

  var manager= {

    waitFor( ...stores) {
      return runtime.dispatcher.waitFor( stores);
    },

    hasChanged() {
      changeEvent.emitFlat( arguments)
    },

    notify( msg) {
      // sendNotification.emit( msg)
      notificationEvent.emit( msg)
    },

    deliver( methods) {
      Object.
        keys( methods).
        forEach(( methodName)=>{
          instance[ methodName]= methods[ methodName]
        })
    },

    handle(store, handlers) {
      if( arguments.length === 1) {
        handlers= store
        store= runtime.getInstance( 'facade', name)
      }
      var getEventName= (actionName)=>{
        return name +'_'+ actionName
      }

      Object.
        keys( handlers).
        forEach(( actionName)=>{
          var eventName= getEventName( actionName),
              fn= handlers[ actionName]
          _handlers[ eventName]= fn //.bind(handlers)
        })

    },

    createEvent(eventName) {
      var event= runtime.createEvent( name, eventName),
          emitterFn= event.emit.bind( event)

      this.deliver( event.public)
      this['emit'+ eventName.camelize( true)]= emitterFn

      return emitterFn
    },

    getClerk() {
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

  instance.id= runtime.dispatcher.register(( action)=>{
    var handler;
    if( handler= _handlers[ action.type]) {  // jshint ignore:line
      handler( action)
    }
  })

  return instance;
}

module.exports= StoreFactory
