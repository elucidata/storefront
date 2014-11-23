var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid')

class Runtime extends EventEmitter {

  constructor() {
    super()
    this.dispatcher= Dispatcher.getInstance()
    this.registry= {}
    this.managers= {}
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
      asyncDispatch: true,
      freezeInstance: false,
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

  defineStore( name, builder) {
    if( kind.isUndefined( builder) ) { //arguments.length === 1) {
      builder= name
      name= uid()
    }
    return this._buildFactory( name, builder)
  }

  getInstance( name, stubMissing) {
    var instance= this.registry[ name]

    if( !instance) {
      if( this.settings.verbose)  {
        console.warn( "Storefront: Store", name, "is not defined.")
      }
      if( stubMissing === true) {
        if( this.settings.verbose)  {
          console.info( "Building stub for ", name)
        }
        instance= { name }
        this.registry[ name]= instance
      }
    }
    // else {
    //   // Increase safety a bit? -- don't wanna freeze it, per se.
    //   instance= Object.create( instance)
    // }

    return instance
  }

  getManager( name) {
    return this.managers[ name]
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
    var manager= this.getManager( name)

    if( manager) {
      manager.resetInternals()
    }

    this.builders
      .filter(( def)=>{
        return def.name === name
      })
      .forEach(( info)=>{
        this._buildFactory( info.name, info.builder, false)
      })

    return this.getInstance( name)
  }

  _buildFactory( name, builder, saveBuilder) {
    var instance= this.registry[ name],
        manager= this.managers[ name],
        returnValue

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
    }

    if(! instance) {
      instance= { name }
      this.registry[ name]= instance
    }
    if(! manager) {
      manager= new Manager( this, name, instance)
      this.managers[ name]= manager
    }

    if( kind.isFunction( builder)) {
      returnValue= builder( manager)
    }
    else if( kind.isObject( builder)) {
      returnValue= builder
    }
    else {
      throw new Error( "Wrong builder type: Must provide a builder function or object.")
    }

    if( kind.isObject( returnValue)) {
      manager.expose( returnValue)
    }

    if( this.settings.freezeInstance === true) {
      Object.freeze( instance)
    }

    if( saveBuilder !== false) {
      this.builders.push({ name, builder, manager })
    }

    return this.getInstance( name)
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
