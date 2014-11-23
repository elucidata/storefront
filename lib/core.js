var Runtime= require( './runtime'),
    alias= require( './alias'),
    runtime= new Runtime()

// Runtime API
module.exports= {

  define:function( name, builder) {
    return runtime.defineStore( name, builder)
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

// DEPRECATED: Remove in a future version...
alias( module.exports, 'define', 'defineStore', 'Store', 'defineClerk', 'Clerk')
