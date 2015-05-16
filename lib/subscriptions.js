var camelize= require( './camelize'),
    alias= require( './alias')



  function Subscriptions(runtime) {"use strict";
    this.$Subscriptions_runtime= runtime
    this.$Subscriptions_storeListeners= []
    alias( this, 'on', 'onStoreEvent', 'onEvent')
    alias( this, 'release', 'off', 'releaseAll')
  }

  Subscriptions.prototype.size=function() {"use strict";
    return this.$Subscriptions_storeListeners.length
  };

  Subscriptions.prototype.on=function(storeName, eventName, callback)  {"use strict";
    storeName= storeName.name || storeName // in case they send a store instance
    var store= this.$Subscriptions_runtime.getInstance( storeName), hookup

    if( store) {
      eventName= camelize( eventName)


      if( hookup= store[ 'on'+ eventName]) {  // jshint ignore:line
        hookup( callback)

        this.$Subscriptions_storeListeners.push({ storeName:storeName, eventName:eventName, callback:callback })
      }
      else {
        if( this.$Subscriptions_runtime.settings.verbose) {
          console.warn( "Storefront: Event", eventName, "isn't supported by store:", storeName)
        }
      }
    }
    else {
      if( this.$Subscriptions_runtime.settings.verbose) {
        console.warn( "Storefront: Store", storeName, "not found")
      }
    }
    return this
  };

  Subscriptions.prototype.release=function() {"use strict";
    this.$Subscriptions_storeListeners.forEach(function( eventInfo) {
      var $__0=   eventInfo,storeName=$__0.storeName,eventName=$__0.eventName,callback=$__0.callback,
          store= this.$Subscriptions_runtime.getInstance( storeName)

      store[ 'off'+ eventName]( callback )
    }.bind(this))

    this.$Subscriptions_storeListeners.length= 0
    this.$Subscriptions_storeListeners= []
    return this
  };



module.exports=
function subscriptions( runtime) {
  return function() {
    return new Subscriptions( runtime )
  }
}
