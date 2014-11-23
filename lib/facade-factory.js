// var type= require( 'elucidata-type'),
//     createManager= require( './manager'),
//     alias= require( './alias'),
//     ensure= require( './ensure'),
//     merge= require( './merge')
//
// class Storefront {
//   constructor( name) {
//     this.name= name
//   }
// }
//
// function FacadeFactory( runtime, name, builder ) {
//   var clerk= runtime.getInstance( 'clerk', name),
//       store= runtime.getInstance( 'store', name),
//       storeFront= new Storefront( name),
//       returnValue,
//       manager= createManager( runtime, name, 'facade', storeFront)
//
//   ensure( clerk && store, "A Store and Clerk are required to create a facade for: "+ name)
//
//   if( type.isFunction( builder)) {
//     returnValue= builder( manager)
//   }
//   else {
//     returnValue= builder
//   }
//
//   if( type.isObject( returnValue)) {
//     manager.exposes( returnValue)
//   }
//
//   storeFront= merge( storeFront, clerk)
//   storeFront= merge( storeFront, store)
//
//   return Object.freeze( storeFront)
// }
//
// module.exports= FacadeFactory
