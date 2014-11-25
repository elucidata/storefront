var test= require( 'tape'),
    Storefront= require( '../../index')


// test( 'Storefront.defineClerk( name, fn) ...', function( t){
//
//   t.ok( Storefront.defineClerk, 'exists.')
//
//   var instance= Storefront.defineClerk( 'Test', function( mgr){
//     t.ok( mgr.exposes, 'clerkManager.exposes exists.')
//     t.ok( mgr.handles, 'clerkManager.handles exists.')
//     t.ok( mgr.provides, 'clerkManager.provides exists.')
//     t.ok( mgr.observes, 'clerkManager.observes exists.')
//     t.ok( mgr.actions, 'clerkManager.actions exists.')
//
//     mgr.actions({
//       setData: function( dispatch, data) {
//         dispatch({ data:data })
//       }
//     })
//   })
//
//   t.deepLooseEqual(
//     Object.keys( instance),
//     Object.keys( Storefront.get( 'Test')),
//     'returns instance from factory call.'
//   )
//
//   t.ok(
//     instance.setData,
//     'exposes provided actions.'
//   )
//
//   t.end()
// })

// test( 'Storefront.defineStore( name, fn) ...', function( t){
//
//   t.ok( Storefront.defineStore, 'exists.')
//
//   var instance= Storefront.defineStore( 'Test', function( mgr){
//     var data= 'RESULT'
//     t.ok( mgr.exposes, 'storeManager.exposes exists.')
//     t.ok( mgr.handles, 'storeManager.handles exists.')
//     t.ok( mgr.provides, 'storeManager.provides exists.')
//     t.ok( mgr.observes, 'storeManager.observes exists.')
//     t.ok( mgr.actions, 'storeManager.actions exists.')
//
//     // console.log( Object.keys( mgr.constructor.prototype))
//
//     mgr.handles({
//       setData: function( action) {
//         data= action.payload.data
//         mgr.dataHasChanged()
//       }
//     })
//     mgr.provides({
//       getData: function() { return data }
//     })
//   })
//
//   t.deepLooseEqual(
//     instance,
//     Storefront.get( 'Test'),
//     'returns instance from factory call.'
//   )
//
//   t.ok(
//     instance.name,
//     'exposes store name.'
//   )
//
//   t.ok(
//     instance.token,
//     'exposes dispatch token.'
//   )
//
//   t.ok(
//     instance.getData,
//     'exposes provided functions.'
//   )
//
//   t.equal(
//     instance.getData(),
//     'RESULT',
//     'returns data from provided functions.'
//   )
//
//   t.end()
// })




// test( 'Storefront.define( name, fn) ...', function( t){
//   t.ok( Storefront.define, 'exists.')
//
//   var store= Storefront.define( 'InlineTest', function( mgr){
//     t.ok( mgr.exposes, 'manager.exposes exists.')
//     t.ok( mgr.handles, 'manager.handles exists.')
//     t.ok( mgr.provides, 'manager.provides exists.')
//     t.ok( mgr.observes, 'manager.observes exists.')
//     t.ok( mgr.actions, 'manager.actions exists.')
//   })
//
//   // console.log( store)
//
//   t.end()
// })
