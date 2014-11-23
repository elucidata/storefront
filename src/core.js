var Runtime= require( './runtime'),
    alias= require( './alias'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  define( name, builder) {
    return runtime.defineComposite( name, builder)
  },

  defineStore( name, builder) {
    return runtime.defineStore( name, builder)
  },

  defineClerk( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  get( name) {
    return runtime.getInstance( name)
  },

  configure( settings) {
    runtime.configure( settings)
    return this
  },

  onChange( fn) {
    runtime.onAnyChange( fn)
    return this
  },

  offChange( fn) {
    runtime.offAnyChange( fn)
    return this
  },

  mixins: {
    eventHelper: require( './event-helper-mixin')( runtime)
  },

  _internals: runtime
}


alias( module.exports, 'defineStore', 'Store')
alias( module.exports, 'defineClerk', 'Clerk')
