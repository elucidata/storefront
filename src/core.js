var Runtime= require( './runtime'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  Store( name, builder) {
    return runtime.defineStore( name, builder)
  },

  Clerk( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  Facade( name, builder) {
    return runtime.defineFacade( name, builder)
  },

  onChange( fn) {
    runtime.onAnyChange( fn)
  },

  offChange( fn) {
    runtime.offAnyChange( fn)
  },

  _internals: runtime
}
