import camelize from './camelize'
import subscriptions from './subscriptions'

export default function eventHelperMixin( runtime ) {
  const _subscriber= subscriptions( runtime )

  return {

    onStoreEvent( storeName, eventName, callback ) {
      if(! this._storefrontSubscriptions ) {
        this._storefrontSubscriptions= _subscriber()
      }
      this._storefrontSubscriptions.on( storeName, eventName, callback )
    },

    componentWillUnmount() {
      if( this._storefrontSubscriptions ) {
        this._storefrontSubscriptions.release()
        this._storefrontSubscriptions= null
      }
    }

  }
}
