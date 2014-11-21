module.exports=
function alias(/* target, prop, ...aliases */) {
  var aliases= Array.prototype.slice.call(arguments),
      target= aliases.shift(),
      prop= aliases.shift(),
      item= target[ prop]
  aliases.forEach(function( alias){
    target[ alias]= item
  })
}
