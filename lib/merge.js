module.exports=
function merge(/* target, ...sources */) {
  var sources= Array.prototype.slice.call( arguments),
      target= sources.shift()

  sources.forEach(function( source){
    Object.
      keys( source).
      forEach(function( key){
        target[ key]= source[ key]
      })
  })

  return target
}
