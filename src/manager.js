var merge= require( './merge'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
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

    bindAll( this,
      'dispatch', 'notify', 'actions', 'waitFor', 'hasChanged', 'before',
      'expose', 'getClerk', 'getStore', 'createEvent', 'invoke'
    )

    alias( this, 'actions', 'action', 'observe', 'observes')
    alias( this, 'get', 'getStore', 'getClerk')
    alias( this, 'expose', 'exposes', 'outlet', 'outlets')
    alias( this, 'createEvent', 'defineEvent')
    alias( this, 'hasChanged', 'dataDidChange', 'dataHasChanged')

    // alias( this, 'handle', 'handles', 'observe', 'observes')
    // alias( this, 'expose', 'exposes', 'provide', 'provides')

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
    return this
  }

  invoke( cmd, ...params) {
    return this._instance[ cmd].apply( this._instance, params)
  }

  notify( message) {
    this._notifyEvent.emit( message)
    return this
  }

  before( methods) {
    var actionDispatchers= {}
    Object.keys( methods).forEach(( actionName)=> {
      var eventName= this.name +'_'+ actionName,
          fn= methods[ actionName],
          boundDispatch= this.dispatch.bind( this, eventName)

      fn.displayName= eventName
      this._instance[ actionName]= fn.bind( this._instance, boundDispatch)
    })
    return this
  }

  actions( store, methods) {
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
      this._handlers[ eventName]= fn //.bind(this._instance)

      if( store == this.name && !this._instance[ actionName]) {
        // Stub out an action...
        var stub= {}
        stub[ actionName]= ()=> {
          var args= Array.prototype.slice.call( arguments),
              dispatch= args.shift()
          if( args.length === 1) {
            dispatch( args[ 0])
          }
          else {
            dispatch( args)
          }
        }
        this.before( stub)
      }
    })
    return this
  }

  waitFor( ...stores) {
    stores= stores.map(( store)=> {
      if( kind.isString( store)) {
        return this.runtime.get( store)
      }
      else {
        return store
      }
    })
    this.runtime.dispatcher.waitFor( stores)
    return this
  }

  hasChanged() {
    this._changeEvent.emitFlat( arguments)
    return this
  }

  expose( methods) {
    Object.keys( methods).forEach(( methodName)=>{
      if( this._instance.hasOwnProperty( methodName)) {
        var method= this._instance[ methodName]

        if(! method._isStub) {
          var error= new Error( "Redefining property "+ methodName +" on store "+ this.name)
          error.framesToPop= 3
          throw error
        }
      }
      this._instance[ methodName]= methods[ methodName]
    })
    return this
  }

  get( storeName) {
    if( storeName ) {
      return this.runtime.get( storeName, true )
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
