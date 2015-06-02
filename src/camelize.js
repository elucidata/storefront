export default function camelize( string ) {
  return String(string).replace( /(?:^|[-_])(\w)/g, ( _, char ) => {
    return char ? char.toUpperCase () : ''
  })
}
