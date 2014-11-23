module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, function( _, c) {
    return c ? c.toUpperCase () : ''
  })
}
