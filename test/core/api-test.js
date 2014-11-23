var test= require( 'tape'),
    Storefront= require( '../../index')

test('Storefront core API...', function( t){

  t.ok( Storefront, 'exists.')

  t.ok( Storefront.get, 'get() is available.')
  t.ok( Storefront.configure, 'configure() is available.')
  t.ok( Storefront._internals, '_internals are available.')
  t.ok( Storefront.onChange, 'onChange() is available.')
  t.ok( Storefront.offChange, 'offChange() is available.')

  Storefront.configure({ verbose:false })

  t.end()
})

test( 'Storefront.defineClerk( name, fn) ...', function( t){

  t.ok( Storefront.defineClerk, 'exists.')

  var instance= Storefront.defineClerk( 'Test', function( mgr){
    t.ok( mgr.exposes, 'clerkManager.exposes exists.')
    t.notOk( mgr.handles, 'clerkManager.handles does not exist.')
    t.notOk( mgr.provides, 'clerkManager.provides does not exist.')
    t.notOk( mgr.observes, 'clerkManager.observes does not exist.')
    t.ok( mgr.actions, 'clerkManager.actions exists.')

    mgr.actions({
      setData: function( dispatch, data) {
        dispatch({ data:data })
      }
    })
  })

  t.deepLooseEqual(
    instance,
    Storefront.get('Test'),
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

    t.notOk( mgr.actions, 'storeManager.actions does not exist.')

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

  t.plan( 9)

  t.ok( Storefront.get, 'exists.')

  var instance= Storefront.get( 'Test')

  t.equal(
    instance,
    Storefront._internals.getInstance( 'Test'),
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

  // This works because dipatching happens on nextTick()
  instance.onChange(function(){

    t.pass('onChange callback triggered')

    t.equal(
      instance.getData(),
      'new data',
      'actions propagate correctly.'
    )

    instance= Storefront._internals.recreateStore( 'Test')

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
