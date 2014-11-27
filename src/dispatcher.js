var uid= require( './uid'),
    now= require( './now')

var THRESHOLD= 10, // In milliseconds
    _singleton_instance= null

module.exports=
class Dispatcher {

  constructor() {
    this.active= false
    this._handlers= {}
    this._processed= {}
    this._tokenList= []
    this._queue= []
  }

  register( handler, preferredToken) {
    if( preferredToken && this._handlers.hasOwnProperty( preferredToken)) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this._handlers[token]= handler
    this._tokenList= Object.keys( this._handlers)
    return token
  }

  deregister( token) {
    var handler;
    if( handler= this._handlers[ token] )  // jshint ignore:line
        delete this._handlers[ token]
    return handler
  }

  waitFor( tokens) {
    if(! this.active) return this
    (tokens || []).forEach(( token)=>{
      // support waitFor params being store instances or store tokens:
      this._callHandler( token.token || token)
    })
    return this
  }

  dispatch( action, callback) {
    if( this.active ) {
      this._queue.push([ action, callback])
      return this
    }

    var length= this._tokenList.length,
        index= 0, start_time, duration

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

      if( duration > THRESHOLD) {
        global[ 'console'].info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( callback) {
      callback() // Should the callback be sent anything?
    }

    if( this._queue.length) {
      // Should this happen on the nextTick?
      var [nextAction, nextCallback]= this._queue.shift()
      this.dispatch( nextAction, nextCallback)
    }

    return this
  }

  _callHandler( token) {
    if( this._processed[ token] === true || !this.active) return
    var handler= this._handlers[ token]

    handler.call( this, this._currentAction, this, token)
    this._processed[ token]= true
  }

  static getInstance() {
    if( _singleton_instance === null) {
      _singleton_instance= new this()
    }
    return _singleton_instance
  }
}
