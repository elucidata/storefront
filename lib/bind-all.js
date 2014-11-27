var kind= require( 'elucidata-type')

module.exports=
function bindAll(/* target, ...props */) {
  var props= Array.prototype.slice.call( arguments),
      target= props.shift()

  props.forEach(function( key){
    var prop= target[ key]
    if( prop && kind.isFunction( prop)) {
      target[ key]= prop.bind( target)
    }
  })

  return target
}
