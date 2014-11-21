var Runtime= require( './runtime'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  Store:function( name, builder) {
    return runtime.defineStore( name, builder)
  },

  Clerk:function( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  Facade:function( name, builder) {
    return runtime.defineFacade( name, builder)
  },

  onChange:function( fn) {
    runtime.onAnyChange( fn)
  },

  offChange:function( fn) {
    runtime.offAnyChange( fn)
  },

  _internals: runtime
}
