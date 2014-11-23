var test= require( 'tape'),
    flatten= require( '../../lib/flatten')

test( 'Flatten...', function( t){

  t.deepEqual(
    flatten([ ['a'], ['b'], 'c']),
    ['a', 'b', 'c'],
    'flattens nested arrays.'
  )

  t.end()
})
