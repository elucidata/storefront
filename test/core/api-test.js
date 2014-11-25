var test= require( 'tape'),
    Storefront= require( '../../index')

test('Storefront core API...', function( t){

  t.ok( Storefront, 'exists.')

  t.ok( Storefront.get, 'get() is available.')
  t.ok( Storefront.configure, 'configure() is available.')
  t.ok( Storefront.onChange, 'onChange() is available.')
  t.ok( Storefront.offChange, 'offChange() is available.')

  Storefront.configure({ verbose:false })

  t.end()
})

test( 'Storefront.defineClerk( name, fn) ...', function( t){

  t.ok( Storefront.defineClerk, 'exists.')

  var instance= Storefront.defineClerk( 'Test', function( mgr){
    t.ok( mgr.exposes, 'clerkManager.exposes exists.')
    t.ok( mgr.handles, 'clerkManager.handles exists.')
    t.ok( mgr.provides, 'clerkManager.provides exists.')
    t.ok( mgr.observes, 'clerkManager.observes exists.')
    t.ok( mgr.actions, 'clerkManager.actions exists.')

    mgr.actions({
      setData: function( dispatch, data) {
        dispatch({ data:data })
      }
    })
  })

  t.deepLooseEqual(
    Object.keys( instance),
    Object.keys( Storefront.get( 'Test')),
    'returns instance from factory call.'
  )

  t.ok(
    instance.setData,
    'exposes provided actions.'
  )

  t.end()
})

test( 'Storefront.defineStore( name, fn) ...', function( t){

  t.ok( Storefront.defineStore, 'exists.')

  var instance= Storefront.defineStore( 'Test', function( mgr){
    var data= 'RESULT'
    t.ok( mgr.exposes, 'storeManager.exposes exists.')
    t.ok( mgr.handles, 'storeManager.handles exists.')
    t.ok( mgr.provides, 'storeManager.provides exists.')
    t.ok( mgr.observes, 'storeManager.observes exists.')
    t.ok( mgr.actions, 'storeManager.actions exists.')

    // console.log( Object.keys( mgr.constructor.prototype))

    mgr.handles({
      setData: function( action) {
        data= action.payload.data
        mgr.dataHasChanged()
      }
    })
    mgr.provides({
      getData: function() { return data }
    })
  })

  t.deepLooseEqual(
    instance,
    Storefront.get( 'Test'),
    'returns instance from factory call.'
  )

  t.ok(
    instance.name,
    'exposes store name.'
  )

  t.ok(
    instance.token,
    'exposes dispatch token.'
  )

  t.ok(
    instance.getData,
    'exposes provided functions.'
  )

  t.equal(
    instance.getData(),
    'RESULT',
    'returns data from provided functions.'
  )

  t.end()
})


test( 'Storefront.get( name) ...', function( t){

  t.plan( 10)

  t.ok( Storefront.get, 'exists.')

  var instance= Storefront.get( 'Test')

  t.deepLooseEqual(
    instance,
    Storefront.get( 'Test'),
    'returns instance from factory call.'
  )

  t.ok(
    instance.getData,
    'exposes provided functions.'
  )

  t.ok(
    instance.setData,
    'exposes provided actions.'
  )

  t.ok(
    instance.onChange,
    'exposes change handlers functions.'
  )

  t.equal(
    instance.getData(),
    'RESULT',
    'fetches data from Store.'
  )

  instance.setData( 'new data')

  Storefront.onChange(function(){
    t.pass('Global onChange called')
  })

  // This works because dipatching happens on nextTick()
  instance.onChange(function(){

    t.pass('onChange callback triggered')

    t.equal(
      instance.getData(),
      'new data',
      'actions propagate correctly.'
    )

    instance= Storefront.recreateStore( 'Test')

    t.equal(
      instance.getData(),
      'RESULT',
      'Store reset to default state.'
    )

  })
})

test( 'Storefront.define( name, fn) ...', function( t){
  t.ok( Storefront.define, 'exists.')

  var store= Storefront.define( 'InlineTest', function( mgr){
    t.ok( mgr.exposes, 'manager.exposes exists.')
    t.ok( mgr.handles, 'manager.handles exists.')
    t.ok( mgr.provides, 'manager.provides exists.')
    t.ok( mgr.observes, 'manager.observes exists.')
    t.ok( mgr.actions, 'manager.actions exists.')
  })

  // console.log( store)

  t.end()
})

test("Inline stores", function(is){

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


test("Automatic action generation", function(is){

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
    mgr.handles({
      runIt: function( action) {
        is.fail('Storefront dupes called.')
      }
    })
  })

  var store= NSF.define('Dupes', function(mgr){
    mgr.handles({
      runIt: function( action) {
        is.pass('NEW Storefront dupes called.')
      }
    })
  })

  store.runIt()

  // is.end()

  // console.log( store)
})
