// var Runtime= require( './runtime'),
//     alias= require( './alias'),
//     runtime= new Runtime()
//
// // Runtime API
// module.exports= {
//
//   define( name, builder) {
//     return runtime.defineStore( name, builder)
//   },
//
//   get( name) {
//     return runtime.getInstance( name)
//   },
//
//   configure( settings) {
//     runtime.configure( settings)
//     return this
//   },
//
//   onChange( fn) {
//     runtime.onAnyChange( fn)
//     return this
//   },
//
//   offChange( fn) {
//     runtime.offAnyChange( fn)
//     return this
//   },
//
//   mixins: {
//     eventHelper: require( './event-helper-mixin')( runtime)
//   },
//
//   _internals: runtime
// }
//
// // DEPRECATED: Remove in a future version...
// alias( module.exports, 'define', 'defineStore', 'Store', 'defineClerk', 'Clerk')
