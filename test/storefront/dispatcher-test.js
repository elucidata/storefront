var test= require( 'tape'),
    Dispatcher= require( '../../lib/dispatcher'),
    Storefront= require( '../../index'),
    notest= function(){}

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

notest( 'Nested dispatches should be queued...', function( is ) {

  is.plan( 12 )

  var RT= Storefront.newInstance()

  var storeA= RT.define('A', function( mgr ){
    mgr.actions({
      start: function() {
        is.pass(
          'StoreA action called'
        )
        for (var i = 1; i <= 5; i++) {
          mgr.get('B').doIt({ count:i, msg:'fromA'})
        }
        is.pass(
          'StoreA action finished'
        )
      }

    })
  })

  var storeB= RT.define('B', function( mgr ){
    mgr.actions({
      doIt: function( action ) {
        is.pass(
          'StoreB action called '+ action.payload.count +' '+ action.payload.msg
        )
        if( action.payload.msg !== '(internally invoked)') {
          mgr.invoke('doIt', { count:action.payload.count, msg:'(internally invoked)' })
        }
      }
    })
  })

  storeA.start()

})
