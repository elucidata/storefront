var test= require( 'tape'), Storefront= require( '../../index')


test("Storefront (inline) store auto-naming...", function(is){

  var store= Storefront.define(function( mgr){

    mgr.actions({
      test: function( action){}
    })

    mgr.outlets({
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
    mgr.actions({
      test: function(a) {}
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


test("Storefront before action...", function(is){

  is.plan( 3)

  var store= Storefront.define(function( mgr){
    mgr.actions({
      test: function(a) {
        is.pass( 'Called action handler.')
      }
    })
    mgr.before({
      test: function(d){
        is.pass( 'Called before handler.')
        d()
      }
    })
  })

  is.ok(
    store,
    "created."
  )

  store.test()

  // is.end()

  // console.log( store)
})
