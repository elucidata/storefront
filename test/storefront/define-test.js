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

    mgr.actions((function () {
      var _class = function () {};

      _class.prototype.resetData = function resetData() {
        data = 'RESULT'
        mgr.dataHasChanged()
      };

      return _class;
    })())

    mgr.outlets({

      getData: function() { return data }
    })

    mgr.outlets((function () {
      var _class = function () {};

      _class.prototype.hasData = function hasData() {
        return data != null
      };

      return _class;
    })())

  }) // End of store definition

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

  t.ok(
    instance.resetData,
    'exposes defined actions (from inline class).'
  )

  t.ok(
    instance.hasData,
    'exposes defined outlets (from inline class).'
  )

  t.equal(
    instance.getData(),
    'RESULT',
    'returns data from provided functions.'
  )

  t.end()
})


test( "Allow non-functions only in returned object from builder", function( is ) {

  var RT= Storefront.newInstance()

  var store= RT.define( 'NewTest', function( mgr ) {
    mgr.action({
      testAction: function() {},
      testActionValue: "Hello"
    })
    mgr.outlets({
      testOutlet: function() {},
      testOutletValue: "Hello"
    })
    return {
      testReturn: function() {},
      testReturnValue: "Hello"
    }
  })

  is.equal( typeof store.testAction, 'function', 'Action function defined.' )
  is.equal( typeof store.testActionValue, 'undefined', 'Action value ignored.' )

  is.equal( typeof store.testOutlet, 'function', 'Outlet function defined.' )
  is.equal( typeof store.testOutletValue, 'undefined', 'Outlet value ignored.' )

  is.equal( typeof store.testReturn, 'function', 'Return function defined.' )
  is.equal( typeof store.testReturnValue, 'string', 'Return value defined.' )

  is.end()
})
