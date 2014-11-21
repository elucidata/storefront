var uid= require('./uid'),
    now= require('./now')

var THRESHOLD= 10 // In milliseconds

class Dispatcher {

  constructor() {
    this._handlers= {}
    this._processed= {}
    this._tokenList= []
    this._queue= []
    this.active= false
  }

  _destructor() {
    this._handlers= null
    this._processed= null
    this._tokenList= null
    this._queue= null
    this.active= false
  }

  dispose() {
    this._destructor()
  }

  register( handler, preferredToken ) {
    if( preferredToken && this._handlers.hasOwnProperty(preferredToken) ) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this._handlers[token]= handler
    this._tokenList= Object.keys( this._handlers )
    return token
  }

  deregister( token ) {
    var handler;
    if( handler= this._handlers[token] )  // jshint ignore:line
        delete this._handlers[ token ]
    return handler
  }

  waitFor( tokens ) {
    if(! this.active ) return this
    // Trigger each one
    for (var i=0, l=tokens.length; i < l; i++) {
      var token = tokens[ i ].token || tokens[ i ]
      this._callHandler( token )
    }
    return this
  }

  dispatch( action, callback ) {
    if( this.active ) {
      this._queue.push([ action, callback ])
      return this
    }

    if( DEBUG ) {
      console.time( action.type )
      console.group( action.type )
    }

    var length= this._tokenList.length,
        index= 0, startTime, duration

    if( length ) {
      startTime= now()
      this.active= true
      this._currentAction= action
      this._processed= {}

      while( index < length ) {
          this._callHandler( this._tokenList[ index ] )
          index += 1
      }

      this._currentAction= null
      this.active= false

      duration= now() - startTime

      if( duration > THRESHOLD ) {
        // alert('long!')
        window['console'].info('Dispatch took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( DEBUG) {
      console.debug( (duration || 0)+ 'ms')
      console.timeEnd( action.type )
      console.groupEnd( action.type )
    }


    if( callback ) callback() // Should the callback be sent anything?

    if( this._queue.length ) {
      // Should this happen on the nextTick?
      var queueAction= this._queue.shift()
      this.dispatch(queueAction[0], queueAction[1])
    }

    return this
  }

  _callHandler( token ) {
    if( this._processed[token] === true || ! this.active ) return
    var handler= this._handlers[ token ]
    handler.call( this, this._currentAction, this, token )
    this._processed[ token ]= true
  }

  static getInstance() {
    if( singleton_instance === null ) {
      singleton_instance= new Dispatcher()
    }
    return singleton_instance
  }
}

var singleton_instance= null

module.exports= Dispatcher
