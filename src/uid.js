var _last_id = 0

function uid ( radix){
  var now = Math.floor( (new Date()).getTime() / 1000 )
  radix= radix || 36

  while ( now <= _last_id ) {
    now += 1
  }

  _last_id= now

  return now.toString( radix)
}

module.exports= uid
