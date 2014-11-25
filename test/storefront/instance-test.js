var test= require( 'tape'), Storefront= require( '../../index')

test(".newInstance()", function(is){

  var NSF= Storefront.newInstance()

  is.plan( 3)

  is.ok(
    NSF,
    "created."
  )

  is.equal(
    NSF.size(),
    0,
    "creates an empty runtime."
  )

  // Make sure old store and new store dispatchers are separate:

  Storefront.define('Dupes', function(mgr){
    mgr.actions({
      runIt: function( action) {
        is.fail('Storefront dupes called.')
      }
    })
  })

  var store= NSF.define('Dupes', function(mgr){
    mgr.actions({
      runIt: function( action) {
        is.pass('NEW Storefront dupes called.')
      }
    })
  })

  store.runIt()

  // is.end()

  // console.log( store)
})
