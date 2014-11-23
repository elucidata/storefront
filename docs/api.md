# Storefront API

```javascript
var Storefront= require( 'storefront')
```

> `Storefront.defineClerk( name, builderFn )`

Defines a clerk:

```javascript
Storefront.defineClerk( 'StoreName', ( clerkMgr)=>{
    // Object keys sent to .actions() become action names
    manager.actions({

        // Available on the storefront instance
        actionName( dispatch, params ) {
            // dispatch() is auto-bound with the action name,
            // 'StoreName_actionName' in this case.

            // Just send the payload to the dispatcher:
            dispatch({ params })
        }
    })
})
```

> `Storefront.defineStore( name, builderFn )`

Defines a store:

```javascript
Storefront.defineStore( 'StoreName', ( storeMgr)=>{

    // Handle actions defined by the Clerk
    storeMgr.handles({
        // Match the object key (method name) from the Clerk's actions block
        actionName( action) {
            // action === {
            //     origin: 'StoreName',
            //     type: 'StoreName_actionName',
            //     payload: { params }
            // }

            // After you have changed your internal data
            // structures, trigger change event
            storeMgr.hasChanged()

            // If you what to send a notify event
            storeMgr.notify( 'A message.')
        }
    })

    // Provide data accessor methods for public consumption
    storeMgr.provides({
        // Available on the storefront instance
        getSomething() {}
    })

    // Listen to actions from other other stores
    storeMgr.observes( 'OtherStore', {
        // Match the action name/mthod of other store
        otherActionName( action) {
            // You can send the name of the store to wait for, or get
            // an instance with: storeMgr.getStore( 'OtherStore')
            storeMgr.waitFor( 'OtherStore')
        }
    })

})
```

> `Storefront.define( name, builderFn )`

Defines an entire storefront in a single pass:

```javascript
// builderFn receives a manager including methods for Clerks and Stores
Storefront.define( 'StoreName', ( manager)=>{
    // You have access to all the manager methods for Clerks and Stores:
    manager.actions({})
    manager.handles({})
    manager.observes({})
    manager.provides({})
    manager.getStore(name)
    manager.getClerk()
    manager.hasChanged()
    manager.notify(msg)
    manager.createEvent() // See 'Custom Events' section below
})
```

Retrieve a defined storefront:

```javascript
Storefront.get( name )
```

Storefront aggregates all defined stores' onChange events into a single top-level change event:

```javascript
Storefront.onChange( fn )
```

Stop listening to aggregated change event:

```javascript
Storefront.offChange( fn )
```

Also:

- `Storefront.configure( settings:object )`
- `Storefront._internals` Runtime instance.

## Storefront Instances

In addition to the methods provided by Stores, and action defined by Clerks, storefront instances also have these properties defined:

```javascript
var store= Storefront.get( "StoreName")
```

Listen for changes:

```javascript
store.onChange( fn )
```

Stop listening for changes:

```javascript
store.offChange( fn )
```

Listen for notifications:

```javascript
store.onNotify( fn )
```

Stop listening for notifications:

```javascript
store.offNotify( fn )
```

## Custom Events

You can define custom events in your store by calling `storeManager.createEvent( name )`. Once defined, store instances have onXXX and offXXX methods (where XXX is the event name). Example:

```javascript
var store= Storefront.define( 'Hotkey', (mgr)=>{
    var emitHotkey= mgr.createEvent('hotkey')

    /// Somewhere in your code:
    emitHotkey( params )
})

// Instances how have support for:
store.onHotkey( fn )
store.offHotkey( fn )
```
