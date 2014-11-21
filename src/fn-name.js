
function getFunctionName ( func ) {
  var fn= func
  return fn.name || fn.displayName || 'anonymous'
}

module.exports= getFunctionName
