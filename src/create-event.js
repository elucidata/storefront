var camelize= require( './camelize'),
    flatten= require( './flatten')

module.exports=
function createEvent( baseName, eventName, emitter, options) {
  var event_key= baseName +':'+ eventName

  options= options || {}

  var eventApi= {

    name: event_key,

    public: {},

    emit: ()=> {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      process.nextTick(()=>{
        emitter.emit.apply( emitter, params)
      })
    },

    emitNow: ()=> {
      var params= Array.prototype.slice.call( arguments)
      params.unshift( event_key)
      emitter.emit.apply( emitter, params)
    },

    emitFlat: ()=> {
      var params= flatten( [ event_key].concat( Array.prototype.slice.call( arguments)))
      process.nextTick(()=>{
        emitter.emit.apply( emitter, params)
      })
    }
  }

  eventApi.public[ 'on'+ camelize( eventName)]= ( fn)=> {
    emitter.on( event_key, fn)
  }

  eventApi.public[ 'off'+ camelize( eventName)]= ( fn)=> {
    emitter.removeListener( event_key, fn)
  }

  return eventApi
}
