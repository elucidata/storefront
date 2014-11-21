var lastId = 0

function uid ( radix){
  var now = Math.floor( (new Date()).getTime() / 1000 )
  radix= radix || 36

  while ( now <= lastId ) {
    now += 1
  }

  lastId = now

  return now.toString( radix )
}

module.exports= uid
