var kind= require( 'elucidata-type')

module.exports=
function extractMethods( source) {
  var results= {}
  if( kind.isFunction( source )) {
    source= getInlineMethods( source)
  }
  for( var name in source) {
    var prop= source[ name]
    if( kind.isFunction( prop)) {
      results[ name]= prop
    }
  }
  return results
}


function getInlineMethods( source ) {
  if(!('getOwnPropertyNames' in Object)) { // Probably mobile?
    return source.prototype // this should work, needs more testing
  }
  var instance= new source(), methods= {}
  Object.getOwnPropertyNames( source.prototype).forEach(( name) => {
    if( name !== 'constructor') {
      methods[ name]= source.prototype[ name]
    }
  })
  return methods
}
