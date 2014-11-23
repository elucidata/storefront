var camelize= require( './camelize')

module.exports=
function eventHelperMixin( runtime) {
  return {
    onStoreEvent( storeName, eventName, callback) {
      storeName= storeName.name || storeName // in case they send a store instance

      var store= runtime.getInstance( storeName), hookup

      if( store) {
        eventName= camelize( eventName)
        if( hookup= store[ 'on'+ eventName]) {  // jshint ignore:line
          hookup( callback)

          if(! this._storeListeners) {
            this._storeListeners= []
          }

          this._storeListeners.push({ storeName, eventName, callback })
        }
        else {
          if( runtime.settings.verbose) {
            console.warn( "Storefront: Event", eventName, "isn't supported by store:", storeName)
          }
        }
      }
    },

    componentWillUnmount() {
      if( this._storeListeners) {

        this._storeListeners.forEach(( eventInfo)=> {
          var {storeName, eventName, callback}= eventInfo,
              store= runtime.getInstance( storeName)
          store[ 'off'+ eventName]( callback )
        })

        this._storeListeners.length= 0
        this._storeListeners= null
      }
    }
  }
}
