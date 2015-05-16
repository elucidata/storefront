var camelize= require( './camelize'),
    subscriptions= require( './subscriptions')

module.exports=
function eventHelperMixin( runtime) {
  var _subscriber= subscriptions( runtime)

  return {
    onStoreEvent( storeName, eventName, callback) {
      if(! this._storefront_subscriptions) {
        this._storefront_subscriptions= _subscriber()
      }
      this._storefront_subscriptions.on( storeName, eventName, callback)
    },
    componentWillUnmount() {
      if( this._storefront_subscriptions) {
        this._storefront_subscriptions.release()
        this._storefront_subscriptions= null
      }
    }
  }
}
