import camelize from './camelize'
import flatten from './flatten'

export default function createEvent( baseName, eventName, emitter, options={} ) {
  const EVENT_KEY = `${ baseName }:${ eventName }`

  const eventApi= {

    name: EVENT_KEY,

    public: {},

    emit: ( ...params ) => {
      params.unshift( EVENT_KEY )
      // process.nextTick(() => {
      //   emitter.emit.apply( emitter, params)
      // })
      emitter.emit.apply( emitter, params)
      return eventApi
    },

    emitNextTick: ( ...params ) => { // CHANGE
      params.unshift( EVENT_KEY )
      process.nextTick(() => {
        emitter.emit.apply( emitter, params)
      })
      return eventApi
    },

    emitNow: ( ...params ) => {
      params.unshift( EVENT_KEY)
      emitter.emit.apply( emitter, params)
      return eventApi
    },

    emitFlat: ( ...params )=> {
      var params= flatten( [ EVENT_KEY ].concat( params ) )
      emitter.emit.apply( emitter, params )
      // process.nextTick(()=>{
      //   emitter.emit.apply( emitter, params)
      // })
      return eventApi
    }
  }

  eventApi.public[ `on${ camelize( eventName ) }` ] = fn => {
    emitter.on( EVENT_KEY, fn)
    return function unsubscribeToChanges() {
      emitter.removeListener( EVENT_KEY, fn )
    }
  }

  eventApi.public[ `off${ camelize( eventName ) }` ] = fn => {
    emitter.removeListener( EVENT_KEY, fn)
    return eventApi
  }

  return eventApi
}
