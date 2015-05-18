var merge= require( './merge'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
    camelize= require( './camelize'),
    extractMethods= require( './extract-methods'),
    kind= require( 'elucidata-type')

module.exports=
class Manager {

  constructor( runtime, name, instance) {
    this.runtime= runtime
    this.name= name

    this._instance= instance
    this._handlers= {}
    this._notifyEvent= runtime.createEvent( name, 'notify')
    this._changeEvent= runtime.createEvent( name, 'change')

    this.expose( this._notifyEvent.public)
    this.expose( this._changeEvent.public)
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

    if( instance.token == null) {  // jshint ignore:line
      instance.token= runtime.dispatcher.register(( action)=>{
        var handler
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
    var fn= this._instance[ cmd]
    if( kind.isFunction( fn)) {
      return fn.apply( this._instance, params)
    }
    else {
      throw new Error( "Method "+ cmd +" not found!")
    }
  }

  notify( message) {
    this._notifyEvent.emitNow( message)
    return this
  }

  before( methods) {
    methods= extractMethods( methods)
    Object.keys( methods).forEach(( action_name)=> {
      var event_name= this.name +'_'+ action_name,
          fn= methods[ action_name],
          bound_dispatch= this.dispatch.bind( this, event_name)

      fn.displayName= event_name
      this._instance[ action_name]= fn.bind( this._instance, bound_dispatch)
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
    methods= extractMethods( methods)
    Object.keys( methods).forEach(( action_name)=>{
      var event_name= store +'_'+ action_name,
          fn= methods[ action_name]

      this._handlers[ event_name]= fn //.bind(this._instance)

      if( store == this.name && !this._instance[ action_name]) {
        // Stub out an action...
        var stub= {}
        stub[ action_name]= ()=> {
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
    methods= extractMethods( methods)
    Object.keys( methods).forEach(( method_name)=>{
      if( this._instance.hasOwnProperty( method_name)) {
        var method= this._instance[ method_name]

        if(! method._isStub) {
          var error= new Error( "Redefining property "+ method_name +" on store "+ this.name)
          error.framesToPop= 3
          throw error
        }
      }
      this._instance[ method_name]= methods[ method_name]
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

  createEvent( eventName, options) {
    options= options || {}
    var event= this.runtime.createEvent( name, eventName, options),
        emitterFn= options.async ? event.emit.bind( event) : event.emitNow.bind( event)

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
