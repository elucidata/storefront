var type= require( 'elucidata-type')

function getFunctionList( source, excludePrototype ) {
  excludePrototype= excludePrototype === false ? false : true

  return Object.
    keys( source).
    filter(( key)=>{
      var prop= source[ key],
          skip= (excludePrototype && !source.hasOwnProperty( key)) ? true : false
      return type.isFunction( prop) && !skip
    }).
    map(( key)=>{
      return {
        name: key,
        function: source[ key]
      }
    })
}

module.exports= getFunctionList
