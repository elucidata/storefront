var test= require( 'tape'),
    flatten= require( '../../lib/flatten')

test( 'lib/flatten.js: Flatten...', function( t){

  t.deepEqual(
    flatten([ ['a'], ['b'], 'c']),
    ['a', 'b', 'c'],
    'nested arrays.'
  )

  t.end()
})
