function ensure( condition, format, a, b, c, d, e, f) {
  if(! condition) {
    var error, args, args_index

    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      )
    }
    else {
      args= [a, b, c, d, e, f]
      args_index= 0

      error= new Error(
        'Violation: ' +
        format.replace( /%s/g, function(){ return args[ args_index++]})
      )
    }

    error.framesToPop= 1 // we don't care about ensure's own frame
    throw error
  }
}

module.exports= ensure
