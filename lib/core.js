var Runtime= require( './runtime'),
    alias= require( './alias'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  define:function( name, builder) {
    return runtime.defineComposite( name, builder)
  },

  defineStore:function( name, builder) {
    return runtime.defineStore( name, builder)
  },

  defineClerk:function( name, builder) {
    return runtime.defineClerk( name, builder)
  },

  get:function( name) {
    return runtime.getInstance( name)
  },

  configure:function( settings) {
    runtime.configure( settings)
    return this
  },

  onChange:function( fn) {
    runtime.onAnyChange( fn)
    return this
  },

  offChange:function( fn) {
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
