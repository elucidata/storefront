var test= require( 'tape'),
    Dispatcher= require( '../../lib/dispatcher')

test( 'Dispatcher...', function( t){

  t.ok(
    Dispatcher,
    'exists.'
  )

  t.equal(
    Dispatcher.getInstance(),
    Dispatcher.getInstance(),
    'returns a single instance for multiple calls to #getInstance().'
  )

  t.end()
})
