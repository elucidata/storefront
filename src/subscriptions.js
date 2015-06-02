import alias from './alias'
import camelize from './camelize'

class Subscriptions {

  constructor( runtime ) {
    this._runtime = runtime
    this._storeListeners = []
    alias( this, 'on', 'onStoreEvent', 'onEvent')
    alias( this, 'release', 'off', 'releaseAll')
  }

  size() {
    return this._storeListeners.length
  }

  on( storeName, eventName, callback ) {
    storeName = storeName.name || storeName // in case they send a store instance

    let store = this._runtime.getInstance( storeName),
        hookup = null

    if( store ) {
      eventName = camelize( eventName )

      if( hookup = store[ `on${ eventName }` ]) {  // jshint ignore:line
        let disconnector = hookup( callback )

        this._storeListeners.push( disconnector )
      }
      else {

        if( this._runtime.settings.verbose ) {
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
    this._storeListeners.forEach( disconnect => disconnect() )
    this._storeListeners= []
    return this
  }
}


export default function subscriptions( runtime ) {
  return () => {
    return new Subscriptions( runtime )
  }
}
