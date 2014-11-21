var alias= require( './alias'),
    type= require( 'elucidata-type')

function ClerkFactory( runtime, name, builder) {
  var instance= {}, returnValue

  var dispatch= (type, payload, callback)=> {
    process.nextTick(()=>{
      runtime.dispatcher.dispatch(
        { origin: name, type, payload },
        callback
      )
    })
  }

  dispatch.send= dispatch

  var manager= {

    actions( actionDefinitions) {
      Object.
        keys( actionDefinitions).
        forEach(( actionName)=>{
          var eventName= name +'_'+ actionName,
              fn= actionDefinitions[ actionName],
              boundDispatch= dispatch.bind( null, eventName)

          fn.displayName= eventName
          instance[ actionName]= fn.bind( instance, boundDispatch)
        })
      return this
    },

    getStore() {
      return runtime.getInstance('store', name)
    }
  }

  alias( manager, 'actions', 'action', 'public')

  if( type.isFunction( builder)) {
    returnValue= builder( manager, manager.actions)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.actions( returnValue)
  }

  return instance
}

module.exports= ClerkFactory
