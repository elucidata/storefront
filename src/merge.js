module.exports=
function merge(/* target, ...sources */) {
  var sources= Array.prototype.slice.call( arguments),
      target= sources.shift()

  sources.forEach(( source)=>{
    Object.
      keys( source).
      forEach(( key)=>{
        target[ key]= source[ key]
      })
  })

  return target
}
