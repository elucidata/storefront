// Creates alias methods. Auto-binds all to target.
module.exports=
function alias(/* target, prop, ...aliases */) {
  var aliases= Array.prototype.slice.call(arguments),
      target= aliases.shift(),
      prop= aliases.shift(),
      item= target[ prop].bind( target)
  aliases.forEach(( alias)=>{
    target[ alias]= item
  })
  target[ prop]= item
}
