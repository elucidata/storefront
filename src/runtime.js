var StoreFactory= require('./store-factory'),
    ClerkFactory= require('./clerk-factory'),
    Dispatcher= require('./dispatcher'),
    Facade= require('./facade'),
    EventEmitter= require('events').EventEmitter

class Runtime extends EventEmitter {

  constructor() {
    super()
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {
      store: {},
      clerk: {},
      facade: {}
    }
    this.factories= {
      store: {},
      clerk: {},
      facade: {}
    }
    this.events= {}

    this._anyChangeEvent= this.createEvent('*', 'any-change')
    this._dataChanges= []
    this._timer= false
  }

  createEvent( storeName, eventName) {
    var event_key= storeName +':'+ eventName,
        helpers= {},
        api= null

    if( api= this.events[ event_key]) {  // jshint ignore:line
      // TODO: Should a recycled event check some flag somewhere to know if it show clear out the listener queue?
      return api
    }

    api= {

      public: {},

      emit: ()=> {
        var params= Array.prototype.slice.call( arguments)
        params.unshift( event_key)
        process.nextTick(()=>{
          this.emit.apply( this, params)
        })
      },

      emitNow: ()=> {
        var params= Array.prototype.slice.call( arguments)
        params.unshift( event_key)
        this.emit.apply( this, params)
      },

      emitFlat: ()=> {
        var params= [ event_key].
          concat( Array.prototype.slice.call( arguments)).
          flatten()
        process.nextTick(()=>{
          this.emit.apply( this, params)
        })
      }
    }

    api.public[ 'on'+ eventName.camelize( true)]= ( fn)=> {
      this.on( event_key, fn)
    }

    api.public[ 'off'+ eventName.camelize( true)]= ( fn)=> {
      this.removeListener( event_key, fn)
    }

    this.events[ event_key]= api

    return api
  }

  knownEvents() {
    return Object.keys( this.events)
  }

  defineStore( name, builder) {
    if( this.hasStore( name)) throw new Error("Store "+ name +" already defined!")

    this.factories.store[ name]= builder

    var store= this.registry.store[ name]= StoreFactory( this, name, builder)

    this._trackChangeFor( name)

    return store
  }

  defineClerk( name, builder) {
    if( this.hasClerk( name)) throw new Error("Clerk "+ name +" already defined!")

    this.factories.clerk[ name]= builder

    var clerk= this.registry.clerk[ name]= ClerkFactory( this, name, builder)

    return clerk
  }

  defineFacade( name, builder) {
    if( this.hasFacade( name)) throw new Error("Facade "+ name +" already defined!")

    this.factories.facade[ name]= builder

    var api= this.registry.facade[ name]= Facade( this, name, builder)

    return api
  }

  getInstance( type, name ) {
    return this.registry[ type][ name]
  }

  getFactory( type, name ) {
    return this.factories[ type][ name]
  }

  hasStore( name) {
    return this.registry.store.hasOwnProperty( name)
  }

  hasClerk( name) {
    return this.registry.clerk.hasOwnProperty( name)
  }

  hasFacade( name) {
    return this.registry.facade.hasOwnProperty( name)
  }

  onAnyChange( fn) {
    this._anyChangeEvent.public.onAnyChange( fn)
  }
  offAnyChange( fn) {
    this._anyChangeEvent.public.offAnyChange( fn)
  }

  _trackChangeFor( name) {
    var eventName= name +':change'
    this.on( eventName, ()=>{
      this._dataChanges.push({ type:eventName, params:Array.prototype.slice.call(arguments)})
      if(! this._timer) {
        process.nextTick( this._relayDataChanges.bind( this))
        this._timer= true
      }
    })
  }

  _relayDataChanges() {
    if( this._dataChanges.length) {
      this._anyChangeEvent.emitNow( this._dataChanges)
      this._dataChanges= []
    }
    this._timer= false
  }
}

// Runtime API
module.exports= Runtime
