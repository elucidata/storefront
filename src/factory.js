var kind= require( 'elucidata-type'),
    createManager= require( './manager')

module.exports=
function Factory(runtime, name, type, builder, instance) {
  instance.name= instance.name || name

  var returnValue,
      manager= createManager( runtime, name, type, instance)

  if( kind.isFunction( builder)) {
    returnValue= builder( manager)
  }
  else if( kind.isObject( builder)) {
    returnValue= builder
  }
  else {
    throw new Error( "Wrong builder type: Must provide a builder function or object.")
  }

  if( kind.isObject( returnValue)) {
    manager.exposes( returnValue)
  }

  if( instance.token == null) {  // jshint ignore:line
    instance.token= runtime.dispatcher.register(( action)=>{
      var handler;
      if( handler= instance._handlers[ action.type]) {  // jshint ignore:line
        handler( action)
      }
    })
  }

  // NOTE: I'd like to remove the handler list from the instance...
  if( instance._handlers == null) {  // jshint ignore:line
    instance._handlers= {}
  }

  return instance
}
