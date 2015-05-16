# Storefront Tips & Tricks

<!-- toc -->

* [Auto Naming](#auto-naming)
* [Testing](#testing)
* [Read-Only Stores](#read-only-stores)

<!-- toc stop -->


## Auto Naming

If you aren't going to use `Storefront.get` to fetch named stores, you can have Storefront generate the store name for you. Since the factory returns the instance, you can use that:

```javascript
var myStore= Storefront.define(( mgr)=>{
    mgr.actions({ /* etc...*/ })
})

myStore // => Storefront instance
```

This means that the internal action names look something like this: `5r7u9_actionName` -- But since you never have to type that, who cares, right?

## Testing

If you need to reset a store, you can reach call `Storefront.resetStore` to do that.

```javascript
// Re-runs the builder function.
Storefront.resetStore( "Auth")
```

Another, perhaps better, approach is to return methods to reset your state in debug/test mode. Something like:

```javascript
module.exports=
Storefront.define( 'Error', ( mgr)=>{
    var {actions, outlets}= mgr

    var errors= []

    actions({
        report( action) {
            errors.push( action.payload.error)
        }
    })

    outlets({
        getErrors() { return errors }
    })

    // If you return an object from the builder function, the properties
    // will be attached to the store instance.
    if( TEST) {
        return {
            resetData() {
                errors= []
            }
        }
    }
})
```

## Read-Only Stores

Some stores may not provide any actions, but will adjust themselves based on other store actions.

```javascript
module.exports=
Storefront.define( 'Navigation', ( mgr)=>{

    var navItems= []

    mgr.outlets({
        getNavItems() {
            return navItems
        }
    })

    var auth= mgr.getStore( 'Auth')

    mgr.observes( auth, {
        login( action) {
            mgr.waitFor( auth)

            // Now you can adjust .navItems then

            mgr.hasChanged()
        }
    })
})
```

## Immutable Stores

It's pretty easy to make a store use Immutable state (using Facebook's Immutable in this example, but you can use what you like):

```javascript
var AppStore= Storefront.define( store => {

    let _state= Immutable.fromJS({
        ready: false,
        version: '1.0.0'
    })

    store.actions({
        setReady({ payload:isReady }) {
            _setState( _state.set( 'ready', isReady ))
        }
    })

    store.outlets({
        isReady() { return _state.get('ready') }
        version() { return _state.get('version') }
        getState() { return _state }
    })

    function _setState( newState ) {
        // Only trigger change when the state has _actually_ changed.
        if(! newState.equals( _state ) ) {
            _state= newState
            store.hasChanged()
        }
    }
})
