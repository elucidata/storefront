// var alias= require( './alias'),
//     type= require( 'elucidata-type'),
//     createManager= require( './manager')
//
// function StoreFactory( runtime, name, builder ) {
//   var instance= {}, returnValue, manager
//
//   manager= createManager( runtime, name, 'store', instance)
//
//   if( type.isFunction( builder)) {
//     returnValue= builder( manager, manager.hasChanged, manager.waitFor, manager.notify)
//   }
//   else {
//     returnValue= builder
//   }
//
//   if( type.isObject( returnValue)) {
//     manager.deliver( returnValue)
//   }
//
//   instance.id= runtime.dispatcher.register(( action)=>{
//     var handler;
//     if( handler= manager._handlers[ action.type]) {  // jshint ignore:line
//       handler( action)
//     }
//   })
//
//   return instance;
// }
//
// module.exports= StoreFactory
