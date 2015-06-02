import Type from 'elucidata-type'

export default function extractMethods( source, allowNonMethods ) {
  let results= {}

  if( Type.isFunction( source )) {
    source= getInlineMethods( source )
  }

  for( let name in source ) {
    let prop= source[ name ]

    if( allowNonMethods === true ) {
      results[ name ]= prop
    }
    else {

      if( Type.isFunction( prop )) {
        results[ name ]= prop
      }
    }
  }

  return results
}


function getInlineMethods( source ) {

  if(! ( 'getOwnPropertyNames' in Object )) { // Probably mobile?
    return source.prototype // this should work, needs more testing
  }

  let instance= new source(),
      methods= {}

  Object.getOwnPropertyNames( source.prototype ).forEach( name => {
    if( name !== 'constructor') {
      methods[ name ]= source.prototype[ name ]
    }
  })

  return methods
}
