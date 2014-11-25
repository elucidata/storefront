var camelize= require( './camelize'),
    flatten= require( './flatten')

module.exports=
function createEvent( baseName, eventName, emitter) {
  var event_key= baseName +':'+ eventName

  var eventApi= {

    name: event_key,

    public: {},

    emit: function() {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      process.nextTick(function(){
        emitter.emit.apply( emitter, params)
      })
    },

    emitNow: function() {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      emitter.emit.apply( emitter, params)
    },

    emitFlat: function() {
      var params= flatten( [ event_key].concat( Array.prototype.slice.call( arguments)))
      process.nextTick(function(){
        emitter.emit.apply( emitter, params)
      })
    }
  }

  eventApi.public[ 'on'+ camelize( eventName)]= function( fn) {
    emitter.on( event_key, fn)
  }

  eventApi.public[ 'off'+ camelize( eventName)]= function( fn) {
    emitter.removeListener( event_key, fn)
  }

  return eventApi
}
