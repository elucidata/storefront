var test= require( 'tape'), Storefront= require( '../../index')


test("Storefront (inline) store auto-naming...", function(is){

  var store= Storefront.define(function( mgr){

    mgr.actions({
      test: function(d){
        d({})
      }
    })

    mgr.handles({
      test: function(a) {

      }
    })

    mgr.provides({
      isTest: true
    })

  })

  is.ok(
    store,
    "created."
  )

  is.ok(
    store.name,
    "creates a name automatically."
  )

  is.end()

  // console.log( store)
})


test("Storefront automatic action generation...", function(is){

  var store= Storefront.define(function( mgr){
    mgr.handles({
      test: function(a) {

      }
    })
  })

  is.ok(
    store,
    "created."
  )

  is.ok(
    store.test,
    "creates an action automatically."
  )

  is.end()

  // console.log( store)
})
