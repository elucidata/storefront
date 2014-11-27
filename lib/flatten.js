module.exports=
function flatten( arrays) {
  var merged= []
  
  return merged.concat.apply( merged, arrays)
}
