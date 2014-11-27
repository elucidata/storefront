module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, function( _, char) {
    return char ? char.toUpperCase () : ''
  })
}
