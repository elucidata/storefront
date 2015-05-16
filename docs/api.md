# Storefront

<!-- toc -->

* [Getting the Storefront object...](#getting-the-storefront-object)
* [Storefront Static API](#storefront-static-api)
    * [`Storefront.configure( settings:object )`](#storefrontconfigure-settingsobject)
    * [`Storefront.define( name:string, builder:function )`](#storefrontdefine-namestring-builderfunction)
    * [`Storefront.get( name:string )`](#storefrontget-namestring)
    * [`Storefront.onChange( fn:function )`](#storefrontonchange-fnfunction)
    * [`Storefront.offChange( fn:function )`](#storefrontoffchange-fnfunction)
    * [`Storefront.newInstance()`](#storefrontnewinstance)
* [Storefront Manager API](#storefront-manager-api)
    * [`manager.actions( methods:object )`](#manageractions-methodsobject)
    * [`manager.before( methods:object )`](#managerbefore-methodsobject)
    * [`manager.createEvent( name:string )`](#managercreateevent-namestring)
    * [`manager.get( name:string )`](#managerget-namestring)
    * [`manager.hasChanged()`](#managerhaschanged)
    * [`manager.invoke( outletOrAction:string|object, ...params:any[] )`](#managerinvoke-outletoractionstringobject-paramsany)
    * [`manager.notify( data:any )`](#managernotify-dataany)
    * [`manager.observes( storeOrName:string|object, methods:object )`](#managerobserves-storeornamestringobject-methodsobject)
    * [`manager.outlets( methods:object )`](#manageroutlets-methodsobject)
    * [`manager.waitFor( storeOrName:string|object )`](#managerwaitfor-storeornamestringobject)
* [Storefront Instance API](#storefront-instance-api)
    * [`store.name:string`](#storenamestring)
    * [`store.onChange( fn:function )`](#storeonchange-fnfunction)
    * [`store.offChange( fn:function )`](#storeoffchange-fnfunction)
    * [`store.onNotify( fn:function )`](#storeonnotify-fnfunction)
    * [`store.offNotify( fn:function )`](#storeoffnotify-fnfunction)
    * [`store.token:string`](#storetokenstring)
  * [Action Stubbing](#action-stubbing)
* [Custom Events](#custom-events)
  * [Event Helper Mixin](#event-helper-mixin)

<!-- toc stop -->



## Getting the Storefront object...

If you're using a **CommonJS** system (browserify/webpack):

```javascript
var Storefront= require( 'storefront')
```

If you are using **Bower**, `Storefront` is available as a global.

In theory, **Require.js** and/or **AMD** modules are supported as well -- But they're completely untested.


## Storefront Static API

#### `Storefront.configure( settings:object )`

Settings object:

name | default | description
---|---|---
`asyncDispatch` | true | Defer dispatching from action creator to nextTick.
`freezeInstance` | false | Use `Object.freeze` on instance after definition.
`logging` | false | Log all dispatches to the console.
`useRAF` | true | Batch all onChange events using requestAnimationFrame.
`verbose` | false | Prints warnings to console.
`singletonDispatcher` | false | Use a global dispatcher instead of a shared-runtime instance.

---

#### `Storefront.define( name:string, builder:function )`

Defines a store:

```javascript
Storefront.define( 'StoreName', ( manager)=>{

    // Object keys sent to .actions() become action names
    storeMgr.actions({
        // Match the object key (method name) from the Clerk's actions block
        actionName( action) {
            // action === {
            //     origin: 'StoreName',
            //     type: 'StoreName_actionName',
            //     payload: { params }
            // }

            // You can wait of other Store like this:
            manager.waitFor( 'OtherStore')

            // Or...
            var otherStore= manager.getStore( 'OtherStore')
            manager.waitFor( otherStore)

            // After you have changed your internal data
            // structures, trigger change event
            manager.hasChanged()

            // If you want to send a notify event
            manager.notify( 'A message.')
        }
    })


    // Create your own "Action Creators"
    manager.before({

        // Available on the storefront instance
        actionName( dispatch, params ) {
            // dispatch() is auto-bound with the action name,
            // 'StoreName_actionName' in this case.

            // Just send the payload to the dispatcher:
            dispatch({ params })
        }
    })


    // Provide data accessor methods for public consumption
    manager.outlets({
        // Available on the storefront instance
        getSomething() {}
    })

    // Listen to actions from other other stores
    manager.observes( 'OtherStore', {
        // Match the action name/mthod of other store
        otherActionName( action) {
            // You can send the name of the store to wait for, or get
            // an instance with: manager.getStore( 'OtherStore')
            manager.waitFor( 'OtherStore')
        }
    })

})
```

---

#### `Storefront.get( name:string )`

Retrieves a defined store.

---

#### `Storefront.onChange( fn:function )`

Storefront aggregates all defined stores' onChange events into a single top-level change event. By default, it will use requestAnimationFrame to schedule event delivery.

---

#### `Storefront.offChange( fn:function )`

Stops listening to aggregated change event.

---

#### `Storefront.newInstance()`

Returns a new Runtime (_Storefront_ instance) configured with the same settings, but none of the store definitions.

---

## Storefront Manager API

The store builder function will be called with an instance of a Manager. This is what you'll use to define your store's API (actions, outlets, observations, etc.).

---

#### `manager.actions( methods:object )`

Define actions that this store will handle. "Action Creators" are automatically created and look like this:

```javascript
stubbed_action_creator= ()=> {
    var args= Array.prototype.slice.call( arguments),
        dispatch= args.shift()
    if( args.length === 1)
        dispatch( args[ 0])
    else
        dispatch( args)
}
```

---

#### `manager.before( methods:object )`

Define custom "Action Creators."

---

#### `manager.createEvent( name:string )`

Create a custom store event. See [Custom Events](#custom-events), below.

---

#### `manager.get( name:string )`

Returns a store instance by name.

---

#### `manager.hasChanged()`

Trigger an onChange event. You need to call this whenever your store's internal data structures have changed.

---

#### `manager.invoke( outletOrAction:string|object, ...params:any[] )`

Call an outlet or action method on the store instance.

---

#### `manager.notify( data:any )`

Trigger a Notify event.

---

#### `manager.observes( storeOrName:string|object, methods:object )`

Listen for actions on other stores.

---

#### `manager.outlets( methods:object )`

Properties specified are created on the store instance.

---

#### `manager.waitFor( storeOrName:string|object )`

Sequences dispatching so that the store specified will have handled the action before this method returns.


---

## Storefront Instance API

In addition to the outlets and actions defined in stores, storefront instances also have these properties defined:

```javascript
// Get a store instance by name...
var store= Storefront.get( "StoreName")
```

---

#### `store.name:string`

The name of the store.

---

#### `store.onChange( fn:function )`

Listen for changes on store instance. Not batched.

---

#### `store.offChange( fn:function )`

Stop listening for changes.

---

#### `store.onNotify( fn:function )`

Listen for notifications.

---

#### `store.offNotify( fn:function )`

Stop listening for notifications.

---

#### `store.token:string`

The token used by the Dispatcher. Primarily for internal use.

---

### Action Stubbing

Storefront will automatically create an action stub for every method defined in the `actions` block:

```javascript
Storefront.define( 'Timer', ( mgr)=>{
    var {actions, outlets, dataHasChanged}= mgr

    var _timer= {
        active: false,
        started: null
    }

    // Just define the 'actions' and the actions will be auto-stubbed
    actions({
        start( action) {
            _timer.active= true
            _timer.started= +new Date
            dataHasChanged()
        },

        stop( action) {
            _timer.active= false
            _timer.started= 0
            dataHasChanged()
        }
    })

    outlets({
        duration() {
            var now = +new Date
            return now - _timer.started
        }
    })
})
```

To implement your own "Action Creators," use the `before` block. It will be provided a `dispatch` function as the first argument. That function is pre-bound to trigger the correct action, so you just call it with your payload.

This is the same Timer example store as above, only it intercepts the `start` action and only dispatches it if the timer isn't already running.

```javascript
Storefront.define( 'Timer', ( mgr)=>{
    var {actions, outlets, dataHasChanged}= mgr

    var _timer= {
        active: false,
        started: null
    }

    before({
        start( dispatch) {
            if( _timer.active === false) {
                dispatch() // carry on
            }
            else {
                console.log( "Timer already started!")
                // dispatch isn't called!
            }
        }
    })

    actions({
        start( action) {
            _timer.active= true
            _timer.started= +new Date
            dataHasChanged()
        },

        stop( action) {
            _timer.active= false
            _timer.started= 0
            dataHasChanged()
        }
    })

    outlets({
        duration() {
            var now = +new Date
            return now - _timer.started
        }
    })
})
```

---

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

---

### Event Helper Mixin

Storefront provides a helper mixin that will register store event listeners and  automatically deregister them at the `componentWillUnmount` lifecycle hook.

It creates the helper method: `onStoreEvent( storeName, eventName, callback)`

Usage:

```javascript
React.createClass({
    mixins: [ Storefront.mixins.eventHelper ],

    componentDidMount() {
        this.onStoreEvent(
            "Auth",                // Store name or Store instance
            "ValidationError",     // Event name
            this.onValidationError // Handler
        )
    }
})
```
