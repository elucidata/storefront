var merge= require( './merge'),
    alias= require( './alias'),
    camelize= require( './camelize'),
    kind= require( 'elucidata-type')

module.exports= class Manager {

  constructor(runtime, name, instance) {
    this.runtime= runtime
    this.name= name

    this._instance= instance
    this._handlers= {}
    this._notifyEvent= runtime.createEvent( name, 'notify')
    this._changeEvent= runtime.createEvent( name, 'change')

    this.expose( this._notifyEvent.public)
    this.expose( this._changeEvent.public)

    alias( this, 'action', 'actions')
    alias( this, 'handle', 'handles', 'observe', 'observes')
    alias( this, 'expose', 'exposes', 'provide', 'provides')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    if( instance.token == null) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register(( action)=>{
        var handler;
        if( handler= this._handlers[ action.type]) {  // jshint ignore:line
          handler( action)
        }
      })
    }
  }

  dispatch( type, payload, callback) {
    if( this.runtime.settings.aysncDispatch) {
      process.nextTick(()=>{
        this.runtime.dispatcher.dispatch(
          { origin: this.name, type, payload },
          callback
        )
      })
    }
    else {
      this.runtime.dispatcher.dispatch(
        { origin: this.name, type, payload },
        callback
      )
    }
  }

  notify( message) {
    this._notifyEvent.emit( message)
  }

  action( methods) {
    Object.keys( methods).forEach(( actionName)=> {
      var eventName= this.name +'_'+ actionName,
          fn= methods[ actionName],
          boundDispatch= this.dispatch.bind( this, eventName)

      fn.displayName= eventName
      // boundDispatch.send= this.dispatch.bind( this)

      this._instance[ actionName]= fn.bind( this._instance, boundDispatch)
    })
  }

  handle( store, methods) {
    if( arguments.length === 1) {
      methods= store
      store= this.name
    }
    else if( kind.isObject( store)) {
      store= store.name
    }

    Object.keys( methods).forEach(( actionName)=>{
      var eventName= store +'_'+ actionName,
          fn= methods[ actionName]
      this._handlers[ eventName]= fn //.bind(handlers)
    })
  }

  waitFor( ...stores) {
    stores= stores.map(( store)=> {
      if( kind.isString( store)) {
        return this.runtime.getInstance( store)
      }
      else {
        return store
      }
    })
    this.runtime.dispatcher.waitFor( stores)
  }

  hasChanged() {
    this._changeEvent.emitFlat( arguments)
  }

  expose( methods) {
    Object.keys( methods).forEach(( methodName)=>{
      if( this._instance.hasOwnProperty( methodName)) {
        var error= new Error( "Redefining property "+ methodName +" on store "+ this.name)
        error.framesToPop= 3
        throw error
      }
      this._instance[ methodName]= methods[ methodName]
    })
  }

  getClerk() {
    return this._instance
  }

  getStore( storeName) {
    if( storeName ) {
      return this.runtime.getInstance( storeName, true )
    }
    else {
      return this._instance
    }
  }

  createEvent( eventName) {
    var event= this.runtime.createEvent( name, eventName),
        emitterFn= event.emit.bind( event)

    this.expose( event.public)
    this._instance[ 'emit'+ camelize( eventName)]= emitterFn

    return emitterFn
  }

  // You shouldn't call this yourself... The runtime will if a resetStore call
  // is made -- usually only in testing!
  resetInternals() {
    this._handlers= {}

    if( this._instance.token) {
      this.runtime.dispatcher.deregister( this._instance.token)
    }

    Object.keys( this._instance).forEach(( key)=>{
      if( key !== 'name') {
        delete this._instance[ key]
      }
    })
  }
}
