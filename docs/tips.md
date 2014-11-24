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

_Note:_ If you're defining the clerk and store separately (`defineClerk` & `defineStore`), this isn't supported.

## Testing

If you need to reset a store, you can reach into `Storefront._internals` to do that.

```javascript
// Re-runs the builder function.
Storefront._internals.resetStore( "Auth")
```

Another approach is to return methods to reset your state in debug/test mode. Something like:

```javascript
module.exports=
Storefront.define( 'Error', ( mgr)=>{

    var errors= []

    mgr.actions({
        report( dispatch, error) { dispatch({ error }) }
    })

    mgr.handles({
        report( action) {
            errors.push( action.payload.error)
        }
    })

    mgr.provides({
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

    mgr.provides({
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
