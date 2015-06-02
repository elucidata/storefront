let _lastGeneratedUID = 0

export default function uid ( radix=36 ){
  let now = Math.floor( (new Date()).getTime() / 1000 )

  while ( now <= _lastGeneratedUID ) {
    now += 1
  }

  _lastGeneratedUID = now

  return now.toString( radix )
}
