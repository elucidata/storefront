import console from './console'
import now from './now'
import uid from './uid'

const THRESHOLD= 10 // In milliseconds

let _singletonInstance= null,
    _logDispatches= false

export default class Dispatcher {

  constructor() {
    this.active = false
    this._handlers = {}
    this._processed = {}
    this._tokenList = []
    this._queue = []
  }

  register( handler, preferredToken ) {
    if( preferredToken && this._handlers.hasOwnProperty( preferredToken )) {
      preferredToken = uid()
    }

    const token = preferredToken || uid()

    this._handlers[ token ] = handler
    this._tokenList = Object.keys( this._handlers )

    return token
  }

  deregister( token) {
    let handler = this._handlers[ token ]
    if( handler ) delete this._handlers[ token ]
    return handler
  }

  waitFor( tokens ) {
    if(! this.active ) return this
    (tokens || []).forEach( token => {
      // support waitFor params being store instances or store tokens:
      this._callHandler( token.token || token )
    })
    return this
  }

  dispatch( action, callback ) {
    if( this.active ) {
      this._queue.push([ action, callback ])
      return this
    }

    let length= this._tokenList.length,
        index= 0, start_time, duration, label

    if( _logDispatches) {
      label= action.type;
      console.time( label)
      console.group( label)
    }

    if( length ) {
      start_time= now()
      this.active= true
      this._currentAction= action
      this._processed= {}

      while( index < length) {
          this._callHandler( this._tokenList[ index])
          index += 1
      }

      this._currentAction= null
      this.active= false

      duration= now() - start_time

      if( _logDispatches && duration > THRESHOLD) {
        console.info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
        // global[ 'console'].info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( _logDispatches) {
      console.groupEnd( label)
      console.timeEnd( label)
    }

    if( callback) {
      callback() // Should the callback be sent anything?
    }

    if( this._queue.length) {
      // Should this happen on the nextTick?
      let [nextAction, nextCallback]= this._queue.shift()
      this.dispatch( nextAction, nextCallback)
    }

    return this
  }

  _callHandler( token) {
    if( this._processed[ token] === true || !this.active) return
    let handler= this._handlers[ token]

    handler.call( this, this._currentAction, this, token)
    this._processed[ token]= true
  }

  static getInstance() {
    if( _singletonInstance === null) {
      _singletonInstance= new this()
    }
    return _singletonInstance
  }

  static enableLogging( enabled) {
    _logDispatches= enabled
  }
}
