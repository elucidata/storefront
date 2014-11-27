var uid= require( './uid'),
    now= require( './now')

var THRESHOLD= 10, // In milliseconds
    _singleton_instance= null

module.exports=
(function(){

  function Dispatcher() {"use strict";
    this.active= false
    this.$Dispatcher_handlers= {}
    this.$Dispatcher_processed= {}
    this.$Dispatcher_tokenList= []
    this.$Dispatcher_queue= []
  }

  Dispatcher.prototype.register=function(handler, preferredToken) {"use strict";
    if( preferredToken && this.$Dispatcher_handlers.hasOwnProperty( preferredToken)) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this.$Dispatcher_handlers[token]= handler
    this.$Dispatcher_tokenList= Object.keys( this.$Dispatcher_handlers)
    return token
  };

  Dispatcher.prototype.deregister=function(token) {"use strict";
    var handler;
    if( handler= this.$Dispatcher_handlers[ token] )  // jshint ignore:line
        delete this.$Dispatcher_handlers[ token]
    return handler
  };

  Dispatcher.prototype.waitFor=function(tokens) {"use strict";
    if(! this.active) return this
    (tokens || []).forEach(function( token){
      // support waitFor params being store instances or store tokens:
      this.$Dispatcher_callHandler( token.token || token)
    }.bind(this))
    return this
  };

  Dispatcher.prototype.dispatch=function(action, callback) {"use strict";
    if( this.active ) {
      this.$Dispatcher_queue.push([ action, callback])
      return this
    }

    var length= this.$Dispatcher_tokenList.length,
        index= 0, start_time, duration

    if( length ) {
      start_time= now()
      this.active= true
      this.$Dispatcher_currentAction= action
      this.$Dispatcher_processed= {}

      while( index < length) {
          this.$Dispatcher_callHandler( this.$Dispatcher_tokenList[ index])
          index += 1
      }

      this.$Dispatcher_currentAction= null
      this.active= false

      duration= now() - start_time

      if( duration > THRESHOLD) {
        global[ 'console'].info( 'Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( callback) {
      callback() // Should the callback be sent anything?
    }

    if( this.$Dispatcher_queue.length) {
      // Should this happen on the nextTick?
      var $__0=  this.$Dispatcher_queue.shift(),nextAction=$__0[0],nextCallback=$__0[1]
      this.dispatch( nextAction, nextCallback)
    }

    return this
  };

  Dispatcher.prototype.$Dispatcher_callHandler=function(token) {"use strict";
    if( this.$Dispatcher_processed[ token] === true || !this.active) return
    var handler= this.$Dispatcher_handlers[ token]

    handler.call( this, this.$Dispatcher_currentAction, this, token)
    this.$Dispatcher_processed[ token]= true
  };

  Dispatcher.getInstance=function() {"use strict";
    if( _singleton_instance === null) {
      _singleton_instance= new this()
    }
    return _singleton_instance
  };
return Dispatcher;})()
