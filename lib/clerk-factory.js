var alias= require( './alias'),
    type= require( 'elucidata-type')

function ClerkFactory( runtime, name, builder) {
  var instance= {}, returnValue

  var dispatch= function(type, payload, callback) {
    process.nextTick(function(){
      runtime.dispatcher.dispatch(
        { origin: name, type:type, payload:payload },
        callback
      )
    })
  }

  dispatch.send= dispatch

  var manager= {

    actions:function( actionDefinitions) {
      Object.
        keys( actionDefinitions).
        forEach(function( actionName){
          var eventName= name +'_'+ actionName,
              fn= actionDefinitions[ actionName],
              boundDispatch= dispatch.bind( null, eventName)

          fn.displayName= eventName
          instance[ actionName]= fn.bind( instance, boundDispatch)
        })
      return this
    },

    getStore:function() {
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
