import Dispatcher from './dispatcher'
import EventEmitter from 'eventemitter3'
import Manager from './manager'
import alias from './alias'
import bindAll from './bind-all'
import camelize from './camelize'
import console from './console'
import createEvent from './create-event'
import ensure from './ensure'
import eventHelperMixin from './event-helper-mixin'
import flatten from './flatten'
import kind from 'elucidata-type'
import merge from './merge'
import now from './now'
import subscriptions from './subscriptions'
import uid from './uid'
import version from './version'

const DEFAULTS= {
  asyncDispatch: true,
  freezeInstance: false,
  useRAF: true,
  verbose: false,
  logging: false,
  singletonDispatcher: false
}

export default class Runtime {

  constructor( settings ) {
    this._emitter = new EventEmitter()
    this._registry = {}
    this._managers = {}
    this._builders = []
    this._events = {}
    this._anyChangeEvent = this.createEvent( '*', 'any-change' )
    this._dataChanges = []
    this._timer = false
    this.version = version

    this.configure( settings)

    if( this.settings.singletonDispatcher ) {
      this.dispatcher = Dispatcher.getInstance()
    }
    else {
      this.dispatcher = new Dispatcher()
    }

    this.util = {
      alias,
      bindAll,
      camelize,
      ensure,
      eventHelperMixin: eventHelperMixin( this ),
      flatten,
      kind,
      merge,
      now,
      subscriptions: subscriptions( this ),
      uid,
    }

    // DEPRECATED:
    this.mixins = {
      eventHelper: eventHelperMixin( this),
      subscriptions: subscriptions( this)
    }

    alias( this, 'get', 'getInstance')
  }

  configure( settings={} ) {
    // Default config settings
    this.settings = merge({}, DEFAULTS, settings )

    Dispatcher.enableLogging( this.settings.logging )

    return this
  }

  newInstance( settings ) {
    return new Runtime( settings || this.settings)
  }

  createEvent( storeName, eventName, options ) {
    var event = createEvent( storeName, eventName, this._emitter, options )

    if(! this._events[ event.name ]) {
      this._events[ event.name ] = event
    }

    return this._events[ event.name ]
  }

  knownEvents() {
    return Object.keys( this._events )
  }

  define( name, builder ) {
    if( kind.isUndefined( builder ) ) {
      builder = name
      name = uid()
    }
    return this._buildFactory( name, builder )
  }

  get( name, stubMissing ) {
    var instance = this._registry[ name ]

    if( !instance) {
      this._warn( "Storefront: Store", name, "is not defined.")
      if( stubMissing === true) {
        this._info( "Storefront: Building stub for", name)
        instance = { name }
        this._registry[ name ] = instance
      }
    }

    return instance
  }

  getManager( name ) {
    return this._managers[ name ]
  }

  hasStore( name ) {
    return this._registry.hasOwnProperty( name )
  }

  onChange( fn ) {
    this._anyChangeEvent.public.onAnyChange( fn )
    return () => {
      this._anyChangeEvent.publish.offAnyChange( fn )
    }
  }

  offChange( fn ) {
    this._anyChangeEvent.public.offAnyChange( fn )
    return this
  }

  size() {
    return this.storeNames().length
  }

  storeNames() {
    return Object.keys( this._registry )
  }

  allStores() {
    let all= {}

    Object.keys( this._registry ).forEach( name => {
      all[ name ]= this._registry[ name ]
    })

    return all
  }

  recreateStore( name ) {
    let manager = this.getManager( name )

    if( manager ) {
      manager.resetInternals()
    }

    this._builders
      .filter( def => {
        return def.name === name
      })
      .forEach( info => {
        this._buildFactory( info.name, info.builder, false )
      })

    return this.get( name )
  }

  _buildFactory( name, builder, saveBuilder ) {
    let instance = this._registry[ name ],
        manager = this._managers[ name ],
        returnValue

    if( instance ) {
      this._warn( 'Storefront:', name, "already defined: Merging definitions.")
    }
    else {
      instance= { name }
      this._registry[ name ]= instance
    }

    if(! manager ) {
      manager= new Manager( this, name, instance )
      this._managers[ name ]= manager
      this._trackChangeFor( name )
    }

    if( kind.isFunction( builder )) {
      returnValue= builder( manager )
    }
    else if( kind.isObject( builder )) {
      returnValue= builder
    }
    else {
      throw new Error( "Wrong builder type: Must provide a builder function or object." )
    }

    if( kind.isObject( returnValue )) {
      manager.expose( returnValue, true )
    }

    if( this.settings.freezeInstance === true ) {
      Object.freeze( instance )
    }

    if( saveBuilder !== false ) {
      this._builders.push({ name, builder, manager })
    }

    return this.get( name )
  }

  _trackChangeFor( name ) {
    const eventName = `${ name }:change`

    this._emitter.on( eventName, ( ...params ) => {
      this._dataChanges.push({ type:eventName, params })

      if(! this._timer ) {
        if( this.settings.useRAF && global.requestAnimationFrame ) {
          requestAnimationFrame( this._relayDataChanges.bind( this ))
        }
        else {
          process.nextTick( this._relayDataChanges.bind( this ))
        }
        this._timer = true
      }
    })
  }

  _stopTrackingChangesFor( name ) {
    const eventName = `${ name }:change`
    this._emitter.removeListener( eventName )
  }

  _relayDataChanges() {
    if( this._dataChanges.length ) {
      this._anyChangeEvent.emitNow( this._dataChanges )
      this._dataChanges= []
    }
    this._timer= false
  }

  _warn() {
    if( this.settings.verbose ) {
      console.warn.apply( console, arguments )
    }
  }
  _info() {
    if( this.settings.verbose ) {
      console.info.apply( console, arguments )
    }
  }

}

