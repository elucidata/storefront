var camelize= require( './camelize'),
    alias= require( './alias')

class Subscriptions {

  constructor( runtime) {
    this._runtime= runtime
    this._storeListeners= []
    alias( this, 'on', 'onStoreEvent', 'onEvent')
    alias( this, 'release', 'off', 'releaseAll')
  }

  size() {
    return this._storeListeners.length
  }

  on( storeName, eventName, callback ) {
    storeName= storeName.name || storeName // in case they send a store instance
    var store= this._runtime.getInstance( storeName), hookup

    if( store) {
      eventName= camelize( eventName)


      if( hookup= store[ 'on'+ eventName]) {  // jshint ignore:line
        hookup( callback)

        this._storeListeners.push({ storeName, eventName, callback })
      }
      else {
        if( this._runtime.settings.verbose) {
          console.warn( "Storefront: Event", eventName, "isn't supported by store:", storeName)
        }
      }
    }
    else {
      if( this._runtime.settings.verbose) {
        console.warn( "Storefront: Store", storeName, "not found")
      }
    }
    return this
  }

  release() {
    this._storeListeners.forEach(( eventInfo)=> {
      var {storeName, eventName, callback}= eventInfo,
          store= this._runtime.getInstance( storeName)

      store[ 'off'+ eventName]( callback )
    })

    this._storeListeners.length= 0
    this._storeListeners= []
    return this
  }
}


module.exports=
function subscriptions( runtime) {
  return function() {
    return new Subscriptions( runtime )
  }
}
