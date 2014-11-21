var type= require('elucidata-type')

function getFunctionList(source, excludePrototype) {
  var results=[], key, prop
  excludePrototype= excludePrototype === false ? false : true

  for( key in source) {
    prop= source[ key]

    if( type.isFunction( prop)) {

      if( excludePrototype && !source.hasOwnProperty(key)) {
        continue
      }

      results.push({
        name: key,
        function: prop
      })
    }
  }
  return results
}

module.exports= getFunctionList
