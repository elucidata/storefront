var test= require( 'tape'), Storefront= require( '../../index')

test( 'Storefront.define( name, fn) ...', function( t){

  t.ok( Storefront.define, 'exists.')

  var instance= Storefront.define( 'Test', function( mgr){
    t.ok( mgr.before, 'manager.before exists.')
    t.ok( mgr.actions, 'manager.actions exists.')
    t.ok( mgr.outlets, 'manager.outlets exists.')
    t.ok( mgr.observes, 'manager.observes exists.')
    t.ok( mgr.actions, 'manager.actions exists.')
    t.ok( mgr.notify, 'manager.notify exists.')
    t.ok( mgr.hasChanged, 'manager.hasChanged exists.')
    t.ok( mgr.waitFor, 'manager.waitFor exists.')
    t.ok( mgr.exposes, 'manager.exposes exists.')

    var data= 'RESULT'

    mgr.actions({

      setData: function( action) {
        data= action.payload
        mgr.dataHasChanged()
      }
    })

    mgr.outlets({

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

  t.ok(
    instance.setData,
    'exposes defined actions.'
  )

  t.equal(
    instance.getData(),
    'RESULT',
    'returns data from provided functions.'
  )

  t.end()
})
