var test= require( 'tape'),
    subscriptions= require( '../../lib/subscriptions'),
    Storefront= require( '../../index')

test( 'lib/subscriptions.js: Event Subscription Manager...', function( t){

  t.plan( 10 )

  t.equal( typeof subscriptions, 'function', 'exists.')
  t.equal( typeof subscriptions(null), 'function', 'generates curried factory.')

  var RT= Storefront.newInstance({
    verbose: false
  })
  var subs= subscriptions(RT)()

  t.ok( subs, 'Returns subscription instance.')

  t.ok( subs.on, 'Instance has on() method.')
  t.ok( subs.release, 'Instance has release() method.')
  t.equal( subs.size(), 0, 'Initial size is 0.')

  var store= RT.define('Test', function( _store ){
    _store.outlets({
      pow: function() {
        // console.log('calling notify!')
        _store.notify('zoom')
      }
    })
  })

  subs.on( store, 'notify', function( s ){
    // console.log(">> Callback!")
    t.equal( s, 'zoom', 'Correctly registered event')
  })

  store.pow()

  t.equal( subs.size(), 1, 'Retains callbacks.')

  subs.on( 'Crap', 'notify', function(){t.fail('Incorrectly registered event')})
  subs.on( 'Test', 'junk', function(){t.fail('Incorrectly registered event')})

  t.equal( subs.size(), 1, 'Ignores missing stores/events.')

  subs.release()


  store.pow()
  store.pow()
  store.pow()

  t.equal( subs.size(), 0, 'Clears callbacks.')

  // t.end()
})
