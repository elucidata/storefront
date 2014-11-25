var uid= require('./uid'),
    now= require('./now')

var THRESHOLD= 10 // In milliseconds



  function Dispatcher() {"use strict";
    this.$Dispatcher_handlers= {}
    this.$Dispatcher_processed= {}
    this.$Dispatcher_tokenList= []
    this.$Dispatcher_queue= []
    this.active= false
  }

  Dispatcher.prototype.$Dispatcher_destructor=function() {"use strict";
    this.$Dispatcher_handlers= null
    this.$Dispatcher_processed= null
    this.$Dispatcher_tokenList= null
    this.$Dispatcher_queue= null
    this.active= false
  };

  Dispatcher.prototype.dispose=function() {"use strict";
    this.$Dispatcher_destructor()
  };

  Dispatcher.prototype.register=function(handler, preferredToken)  {"use strict";
    if( preferredToken && this.$Dispatcher_handlers.hasOwnProperty(preferredToken) ) {
      preferredToken= uid()
    }

    var token = preferredToken || uid()
    this.$Dispatcher_handlers[token]= handler
    this.$Dispatcher_tokenList= Object.keys( this.$Dispatcher_handlers )
    return token
  };

  Dispatcher.prototype.deregister=function(token)  {"use strict";
    var handler;
    if( handler= this.$Dispatcher_handlers[token] )  // jshint ignore:line
        delete this.$Dispatcher_handlers[ token ]
    return handler
  };

  Dispatcher.prototype.waitFor=function(tokens)  {"use strict";
    if(! this.active ) return this
    // Trigger each one
    for (var i=0, l=tokens.length; i < l; i++) {
      var token = tokens[ i ].token || tokens[ i ]
      this.$Dispatcher_callHandler( token )
    }
    return this
  };

  Dispatcher.prototype.dispatch=function(action, callback)  {"use strict";
    if( this.active ) {
      this.$Dispatcher_queue.push([ action, callback ])
      return this
    }

    var length= this.$Dispatcher_tokenList.length,
        index= 0, startTime, duration

    if( length ) {
      startTime= now()
      this.active= true
      this.$Dispatcher_currentAction= action
      this.$Dispatcher_processed= {}

      while( index < length ) {
          this.$Dispatcher_callHandler( this.$Dispatcher_tokenList[ index ] )
          index += 1
      }

      this.$Dispatcher_currentAction= null
      this.active= false

      duration= now() - startTime

      if( duration > THRESHOLD ) {
        global['console'].info('Dispatch of', action.type ,'took >', THRESHOLD, 'ms') // jshint ignore:line
      }

    }

    if( callback ) callback() // Should the callback be sent anything?

    if( this.$Dispatcher_queue.length ) {
      // Should this happen on the nextTick?
      var queueAction= this.$Dispatcher_queue.shift()
      this.dispatch( queueAction[0], queueAction[1])
    }

    return this
  };

  Dispatcher.prototype.$Dispatcher_callHandler=function(token)  {"use strict";
    if( this.$Dispatcher_processed[token] === true || ! this.active ) return
    var handler= this.$Dispatcher_handlers[ token ]
    handler.call( this, this.$Dispatcher_currentAction, this, token )
    this.$Dispatcher_processed[ token ]= true
  };

  Dispatcher.getInstance=function() {"use strict";
    if( singleton_instance === null ) {
      singleton_instance= new Dispatcher()
    }
    return singleton_instance
  };


var singleton_instance= null

module.exports= Dispatcher
