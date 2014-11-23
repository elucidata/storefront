module.exports=
function camelize( string) {
  return string.replace( /(?:^|[-_])(\w)/g, ( _, c)=> {
    return c ? c.toUpperCase () : ''
  })
}
