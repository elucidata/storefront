var merge= require( './merge'),
    alias= require( './alias'),
    camelize= require( './camelize'),
    kind= require( 'elucidata-type')

module.exports=
function Manager( runtime, name, type, instance) {
  instance= instance || {}

  // Shared props...
  var manager= {
    _name: name,
    _type: type,
    _instance: instance,

    exposes( methods) {
      Object.keys( methods).forEach(( methodName)=>{
        instance[ methodName]= methods[ methodName]
      })
    },

    getStore( storeName) {
      if( storeName ) {
        return runtime.getInstance( storeName )
      }
      else {
        return instance
      }
    },

    createEvent( eventName) {
      var event= runtime.createEvent( name, eventName),
      emitterFn= event.emit.bind( event)

      manager.exposes( event.public)
      instance[ 'emit'+ camelize( eventName)]= emitterFn

      return emitterFn
    }
  }
  alias( manager, 'exposes', 'expose')
  alias( manager, 'createEvent', 'defineEvent')

  if( type === 'clerk' || type === '*') {
    // Dispatcher method...
    var dispatch= (type, payload, callback)=> {
      process.nextTick(()=>{
        runtime.dispatcher.dispatch(
          { origin: name, type, payload },
          callback
        )
      })
    }
    dispatch.send= dispatch

    manager= merge( manager, {

      actions( actionDefinitions) {
        Object.keys( actionDefinitions).forEach(( actionName)=>{
          var eventName= name +'_'+ actionName,
              fn= actionDefinitions[ actionName],
              boundDispatch= dispatch.bind( null, eventName)

          fn.displayName= eventName
          instance[ actionName]= fn.bind( instance, boundDispatch)
        })
      }
    })

    alias( manager, 'actions', 'action')
  }

  if( type === 'store' || type === '*') {
    var notificationEvent= runtime.createEvent( name, 'notify'),
        changeEvent= runtime.createEvent( name, 'change')

    if(! instance._handlers) {
      instance._handlers= {}
    }

    manager= merge( manager, {

      _handlers: {},

      waitFor( ...stores) {
        stores= stores.map(( store)=> {
          if( kind.isString( store)) {
            return runtime.getInstance( store)
          }
          else {
            return store
          }
        })
        return runtime.dispatcher.waitFor( stores);
      },

      hasChanged() {
        changeEvent.emitFlat( arguments)
      },

      notify( msg) {
        notificationEvent.emit( msg)
      },

      handles( store, handlers) {
        if( arguments.length === 1) {
          handlers= store
          store= name//runtime.getInstance( 'facade', name)
        }
        else if( kind.isObject( store)) {
          store= store.name//runtime.getInstance( 'facade', store)
        }

        var getEventName= (actionName)=>{
          return store +'_'+ actionName
        }

        Object.keys( handlers).forEach(( actionName)=>{
          var eventName= getEventName( actionName),
              fn= handlers[ actionName]
          instance._handlers[ eventName]= fn //.bind(handlers)
        })
      },

      getClerk() {
        // return runtime.getInstance( 'clerk', name)
        return instance
      }
    })

    alias( manager, 'handles', 'handle', 'observes', 'observe')
    alias( manager, 'hasChanged', 'dataDidChange', 'dataHasChanged')
    alias( manager, 'exposes', 'provides', 'provide')

    manager.exposes( changeEvent.public)
    manager.exposes( notificationEvent.public)
  }

  return manager
}
