// var alias= require( './alias'),
//     type= require( 'elucidata-type'),
//     createManager= require( './manager')
//
// function ClerkFactory( runtime, name, builder) {
//   var instance= {}, returnValue, manager
//
//   manager= createManager( runtime, name, 'clerk', instance)
//
//   if( type.isFunction( builder)) {
//     returnValue= builder( manager, manager.actions)
//   }
//   else {
//     returnValue= builder
//   }
//
//   if( type.isObject( returnValue)) {
//     manager.actions( returnValue)
//   }
//
//   return instance
// }
//
// module.exports= ClerkFactory
