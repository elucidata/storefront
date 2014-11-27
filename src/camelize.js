module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, ( _, char)=> {
    return char ? char.toUpperCase () : ''
  })
}
