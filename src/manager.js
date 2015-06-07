import Type from 'elucidata-type'
import alias from './alias'
import bindAll from './bind-all'
import camelize from './camelize'
import extractMethods from './extract-methods'
import merge from './merge'

export default class Manager {

  constructor( runtime, name, instance ) {
    this.runtime = runtime
    this.name = name

    this._instance = instance
    this._handlers = {}
    this._notifyEvent = runtime.createEvent( name, 'notify')
    this._changeEvent = runtime.createEvent( name, 'change')

    this.expose( this._notifyEvent.public )
    this.expose( this._changeEvent.public )
    this.expose({
      listen: this._changeEvent.public.onChange,
      unlisten: this._changeEvent.public.offChange
    })

    bindAll( this,
      'dispatch', 'notify', 'actions', 'waitFor', 'hasChanged', 'before',
      'expose', 'get', 'before', 'createEvent', 'invoke'
    )

    alias( this, 'actions', 'action', 'observe', 'observes')
    alias( this, 'get', 'getStore', 'getClerk')
    alias( this, 'expose', 'exposes', 'outlet', 'outlets')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    if( instance.token == null ) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register( action => {
        let handler = this._handlers[ action.type ]
        if( handler ) {
          handler( action)
        }
      })
    }
  }

  dispatch( type, payload, callback ) {
    const doDispatch = () => {
      this.runtime.dispatcher.dispatch(
        { origin: this.name, type, payload },
        callback
      )
    }

    if( this.runtime.settings.aysncDispatch ) {
      process.nextTick( doDispatch )
    }
    else {
      doDispatch()
    }

    return this
  }

  invoke( cmd, ...params ) {
    const fn= this._instance[ cmd ]

    if( Type.isFunction( fn )) {
      return fn.apply( this._instance, params )
    }
    else if( cmd.indexOf( '.' )) {
      let [storeName, fnName]= cmd.split( '.' ),
          store= this.runtime.get( storeName )
      if( store ) {
        store.invoke( fnName, ...params)
      }
      else {
        throw new Error( `Store ${ storeName } not found for invocation: '${ cmd }'!` )
      }
    }
    else {
      throw new Error( `Method ${ cmd } not found!` )
    }
  }

  notify( message ) {
    this._notifyEvent.emitNow( message )
    return this
  }

  before( methods ) {
    methods= extractMethods( methods )

    Object.keys( methods ).forEach( actionName => {
      var eventName= `${ this.name }_${ actionName }`,
          fn= methods[ actionName ],
          boundDispatch= this.dispatch.bind( this, eventName )

      fn.displayName= eventName
      this._instance[ actionName ] = fn.bind( this._instance, boundDispatch )
    })

    return this
  }

  actions( store, methods ) {
    if( arguments.length === 1 ) {
      methods = store
      store = this.name
    }
    else if( Type.isObject( store )) {
      store = store.name
    }

    if( Type.isNotString( store )) {
      throw new Error( `Unknown store type: ${ Type( store )}` )
    }

    methods= extractMethods( methods )

    Object.keys( methods ).forEach( actionName => {
      let eventName= `${ store }_${ actionName }`,
          fn= methods[ actionName ]

      this._handlers[ eventName ] = fn.bind( this._instance ) // Change?!

      if( store == this.name && !this._instance[ actionName ]) {
        // Stub out an action...
        let stub= {}

        stub[ actionName ]= function( dispatch, ...args ) {
          if( args.length === 1) {
            dispatch( args[ 0 ] )
          }
          else {
            dispatch( args )
          }
        }

        stub[ actionName ]._isStub = true

        this.before( stub )
      }
    })

    return this
  }

  waitFor( ...stores ) {
    stores= stores.map( store => {
      if( Type.isString( store )) {
        return this.runtime.get( store )
      }
      else {
        return store
      }
    })

    this.runtime.dispatcher.waitFor( stores )

    return this
  }

  hasChanged( ...keys ) {
    this._changeEvent.emit( keys )
    return this
  }

  expose( methods, allowNonMethods=false ) {
    methods= extractMethods( methods, allowNonMethods )

    Object.keys( methods ).forEach( methodName => {
      if( this._instance.hasOwnProperty( methodName )) {
        let error= new Error( `Redefinition of '${ methodName }' in store '${ storeName }' not allowed.` )
        error.framesToPop= 3
        throw error
        // let method= this._instance[ methodName ]

        // if(! method._isStub ) {
        //   let error= new Error( `Redefinition of '${ methodName }' in store ${ storeName } not allowed.` )
        //   error.framesToPop= 3
        //   throw error
        // }
        // else {
        //   console.log( "Method is a stub, go ahead.", methodName)
        // }
      }

      this._instance[ methodName ]= methods[ methodName ]
    })

    return this
  }

  get( storeName ) {
    if( storeName ) {
      return this.runtime.get( storeName, true )
    }
    else {
      return this._instance
    }
  }

  createEvent( eventName, options={} ) {
    let event= this.runtime.createEvent( name, eventName, options ),
        emitterFn= options.async ? event.emitNextTick.bind( event ) : event.emit.bind( event )

    this.expose( event.public )
    this._instance[ `emit${ camelize( eventName ) }` ] = emitterFn

    return emitterFn
  }

  // You shouldn't call this yourself... The runtime will if a resetStore call
  // is made -- usually only in testing!
  resetInternals() {
    this._handlers= {}

    if( this._instance.token ) {
      this.runtime.dispatcher.deregister( this._instance.token )
    }

    Object.keys( this._instance ).forEach( key => {
      if( key !== 'name' ) {
        delete this._instance[ key ]
      }
    })
  }
}
