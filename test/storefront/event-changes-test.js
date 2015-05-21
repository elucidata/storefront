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


  Storefront.onChange(function(){
    t.pass('Global onChange called')
  })

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

  instance.setData( 'new data')

})


test( 'Store.onChanged( fn) callbacks...', function( is){

  var allEvents= 7,
      aggregatedEvents= 3

  is.plan( allEvents)

  var rt= Storefront.newInstance()

  is.ok(
    rt,
    'Using new instance'
  )

  var store= rt.define(function( m ){
    var data= null
    m.actions({
      updateData: function(action) {
        data= action.payload
        m.hasChanged()
      }
    })
    m.outlets({
      getData: function() {
        return data
      }
    })
  })

  var unsubscribe= store.onChange(function(){
    is.pass(
      '<instance>.onChange called!'
    )
  })

  store.updateData(1)
  store.updateData(2)
  store.updateData(3)
  store.updateData(9)
  store.updateData(3)

  var finalData= store.getData()

  unsubscribe()

  // These shouldn't trigger a callback.
  store.updateData(3)
  store.updateData(9)
  store.updateData(3)

  is.equal(
    finalData,
    3,
    "Returns last result of updateData() call."
  )

  // is.end()
})
