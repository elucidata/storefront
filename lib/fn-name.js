
function getFunctionName ( func ) {
  var fn= func || func.constructor
  return fn.name || fn.displayName || 'anonymous'
}

module.exports= getFunctionName
