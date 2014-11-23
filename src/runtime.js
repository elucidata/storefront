var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    storeFactory= require( './factory')

class Runtime extends EventEmitter {

  constructor() {
    super()
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {}
    this.builders= []
    this.events= {}
    this._anyChangeEvent= this.createEvent('*', 'any-change')
    this._dataChanges= []
    this._timer= false
    this.configure()
  }

  configure( settings) {
    // Default config settings
    this.settings= merge({
      useRAF: false,
      verbose: true
    }, settings || {})
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
        var params= flatten( [ event_key].concat( Array.prototype.slice.call( arguments)))
        process.nextTick(()=>{
          this.emit.apply( this, params)
        })
      }
    }

    api.public[ 'on'+ camelize( eventName)]= ( fn)=> {
      this.on( event_key, fn)
    }

    api.public[ 'off'+ camelize( eventName)]= ( fn)=> {
      this.removeListener( event_key, fn)
    }

    this.events[ event_key]= api

    return api
  }

  knownEvents() {
    return Object.keys( this.events)
  }

  defineComposite( name, builder) {
    return this._buildFactory( name, '*', builder)
  }

  defineStore( name, builder) {
    return this._buildFactory( name, 'store', builder)
  }

  defineClerk( name, builder) {
    return this._buildFactory( name, 'clerk', builder)
  }

  getInstance( name ) {
    var instance= this.registry[ name]

    if( !instance && this.settings.verbose) {
      console.warn( "Storefront: Store", name, "is not defined.")
    }
    
    return instance
  }

  hasStore( name) {
    return this.registry.hasOwnProperty( name)
  }

  onAnyChange( fn) {
    this._anyChangeEvent.public.onAnyChange( fn)
  }

  offAnyChange( fn) {
    this._anyChangeEvent.public.offAnyChange( fn)
  }

  recreateStore( name) {
    delete this.registry[ name]

    this.builders
      .filter(( def)=>{
        return def.name === name
      })
      .forEach(( info)=>{
        this._buildFactory( info.name, info.type, info.builder, false)
      })

    return this.registry[ name]
  }

  _buildFactory( name, type, builder, saveBuilder) {
    var instance= this.registry[ name]

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
    }

    instance= storeFactory(this, name, type, builder, instance)

    this.registry[ name]= instance

    if( saveBuilder !== false) {
      this.builders.push({ name, type, builder })
    }

    return instance
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
