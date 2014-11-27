var Dispatcher= require( './dispatcher'),
    EventEmitter= require( 'events').EventEmitter,
    Manager= require( './manager'),
    kind= require( 'elucidata-type'),
    camelize= require( './camelize'),
    merge= require( './merge'),
    flatten= require( './flatten'),
    uid= require( './uid'),
    alias= require( './alias'),
    bindAll= require( './bind-all'),
    createEvent= require( './create-event'),
    eventHelperMixin= require( './event-helper-mixin')

class Runtime extends EventEmitter {

  constructor( settings) {
    super()
    this.configure( settings)

    this._registry= {}
    this._managers= {}
    this._builders= []
    this._events= {}
    this._anyChangeEvent= this.createEvent('*', 'any-change')
    this._dataChanges= []
    this._timer= false

    if( this.settings.singletonDispatcher) {
      this.dispatcher= Dispatcher.getInstance()
    }
    else {
      this.dispatcher= new Dispatcher()
    }

    this.mixins={
      eventHelper: eventHelperMixin( this)
    }

    alias( this, 'get', 'getInstance')
  }

  configure( settings) {
    // Default config settings
    this.settings= merge({
      asyncDispatch: true,
      freezeInstance: false,
      useRAF: true,
      verbose: false,
      singletonDispatcher: false
    }, settings || {})
    return this
  }

  newInstance( settings) {
    return new Runtime( settings || this.settings)
  }

  createEvent( storeName, eventName) {
    var event= createEvent( storeName, eventName, this)

    if(! this._events[ event.name]) {
      this._events[ event.name]= event
    }

    return this._events[ event.name]
  }

  knownEvents() {
    return Object.keys( this._events)
  }

  define( name, builder) {
    if( kind.isUndefined( builder) ) { //arguments.length === 1) {
      builder= name
      name= uid()
    }
    return this._buildFactory( name, builder)
  }

  get( name, stubMissing) {
    var instance= this._registry[ name]

    if( !instance) {
      if( this.settings.verbose)  {
        console.warn( "Storefront: Store", name, "is not defined.")
      }
      if( stubMissing === true) {
        if( this.settings.verbose)  {
          console.info( "Building stub for ", name)
        }
        instance= { name }
        this._registry[ name]= instance
      }
    }

    return instance
  }

  getManager( name) {
    return this._managers[ name]
  }

  hasStore( name) {
    return this._registry.hasOwnProperty( name)
  }

  onChange( fn) {
    this._anyChangeEvent.public.onAnyChange( fn)
    return this
  }

  offChange( fn) {
    this._anyChangeEvent.public.offAnyChange( fn)
    return this
  }

  size() {
    return this.storeNames().length
  }

  storeNames() {
    return Object.keys( this._registry)
  }

  recreateStore( name) {
    var manager= this.getManager( name)

    if( manager) {
      manager.resetInternals()
    }

    this._builders
      .filter(( def)=>{
        return def.name === name
      })
      .forEach(( info)=>{
        this._buildFactory( info.name, info.builder, false)
      })

    return this.get( name)
  }

  _buildFactory( name, builder, saveBuilder) {
    var instance= this._registry[ name],
        manager= this._managers[ name],
        return_value

    if( instance && this.settings.verbose) {
      console.warn(name, "already defined: Merging definitions.")
    }

    if(! instance) {
      instance= { name }
      this._registry[ name]= instance
    }
    if(! manager) {
      manager= new Manager( this, name, instance)
      this._managers[ name]= manager
      this._trackChangeFor( name)
    }

    if( kind.isFunction( builder)) {
      return_value= builder( manager)
    }
    else if( kind.isObject( builder)) {
      return_value= builder
    }
    else {
      throw new Error( "Wrong builder type: Must provide a builder function or object.")
    }

    if( kind.isObject( return_value)) {
      manager.expose( return_value)
    }

    if( this.settings.freezeInstance === true) {
      Object.freeze( instance)
    }

    if( saveBuilder !== false) {
      this._builders.push({ name, builder, manager })
    }

    return this.get( name)
  }

  _trackChangeFor( name) {
    var eventName= name +':change'
    this.on( eventName, ()=>{
      this._dataChanges.push({ type:eventName, params:Array.prototype.slice.call(arguments)})

      if(! this._timer) {
        if( this.settings.useRAF && global.requestAnimationFrame) {
          requestAnimationFrame( this._relayDataChanges.bind( this))
        }
        else {
          process.nextTick( this._relayDataChanges.bind( this))
        }
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

module.exports= Runtime
