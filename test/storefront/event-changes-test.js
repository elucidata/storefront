var test= require( 'tape'),
    Storefront= require( '../../index.js')

test( 'Storefront.onChanged( fn) ...', function( t){

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
