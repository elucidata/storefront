# Storefront Tips & Tricks

<!-- toc -->

* [Auto Naming](#auto-naming)
* [Testing](#testing)
* [Ogre Stores](#ogre-stores)
* [Read-Only Stores](#read-only-stores)
* [Immutable Stores](#immutable-stores)


<!-- toc stop -->


## Auto Naming

If you aren't going to use `Storefront.get` to fetch named stores, you can have Storefront generate the store name for you. Since the factory returns the instance, you can use that:

```javascript
var myStore= Storefront.define( mgr =>{
    mgr.actions({ 
        /* etc...*/ 
    })
})

myStore // => Storefront instance
```

This means that the internal action names look something like this: `5r7u9_actionName` -- But since you never have to type that, who cares, right?


## Testing

If you need to reset a store, you can call `Storefront.resetStore` to do that.

```javascript
// Re-runs the builder function.
Storefront.resetStore( "Auth" )
```

Another, perhaps better, approach is to return methods to reset your state in debug/test mode. Something like:

```javascript
module.exports=
Storefront.define( 'Error', store => {
    const {actions, outlets} = store

    var errors= []

    actions({
        report( action ) {
            errors.push( action.payload.error )
        }
    })

    outlets({
        getErrors() { return errors }
    })

    // If you return an object from the builder function, the properties
    // will be attached to the store instance.
    if( TEST_ENV ) {
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
Storefront.define( 'Navigation', mgr => {

    var navItems= []

    mgr.outlets({
        getNavItems() {
            return navItems
        }
    })

    var auth= mgr.getStore( 'Auth' )

    mgr.observes( auth, {
        login( action ) {
            mgr.waitFor( auth )

            // Now you can adjust .navItems then

            mgr.hasChanged()
        }
    })
})
```


## Ogre Stores

Storefront works great with [Ogre](https://github.com/elucidata/ogre2)!

_stores/User.js_
```javascript
export default Storefront.define( 'User', store => {
  const state= createStoreState( store, {
    users: []
  })

  store.actions(class {
    addUser({ payload:user }) {
      state.push( 'users', user )
    }
  })

  store.outlets({
    getActive: () => state.filter( 'users', user => user.isActive )
  })

})
```

Simple shared app state helper:

_applicationState.js_
```javascript
export const applicationState= new Ogre({}, { strict:false })

export const storeStates= applicationState.scopeTo( 'store' )

export function createStoreState( store, initial={} ) {
  const storeState= storeStates.scopeTo( store.name )

  storeState.set( initial )

  store.outlet({
    getState() {
      return storeState.getState()
    }
  })

  storeState.onChange( changes => {
    console.debug( 'Store', store.name, 'changed!' )
    store.hasChanged()
  })

  storeState.resetToDefault= () => {
    storeState.set( initial )
    return storeState
  }

  return storeState
}

export function getStoreStates() {
  return storeStates
}
```



## Immutable Stores

It's pretty easy to make a store use Immutable state (using Facebook's Immutable in this example, but you can use what you like):

```javascript
var AppStore= Storefront.define( store => {

    let state= Immutable.fromJS({
        ready: false,
        version: '1.0.0'
    })

    store.actions({
        setReady({ payload:isReady }) {
            setState( state.set( 'ready', isReady ))
        }
    })

    store.outlets({
        isReady() { return state.get( 'ready' ) }
        version() { return state.get( 'version' ) }
        getState() { return state }
    })

    function setState( newState ) {
        // Only trigger change when the state has _actually_ changed.
        if(! newState.equals( state ) ) {
            state = newState
            store.hasChanged()
        }
    }
})
```

**Add Cursors and Shared App State**

_app-state.js_
```javascript
import Immutable from 'immutable'
import Cursor from 'immutable/contrib/cursor'

let rootState= Immutable.fromJS({})

export function createState( store, initial={} ) {
  const storeState= Immutable.fromJS( initial )

  rootState= rootState.set( store.name, storeState )

  const storeCursor= Cursor.from( rootState, [ store.name ], newState => {
    const wrappedNewState= Immutable.fromJS( newState )

    if(! rootState.equals( wrappedNewState )) {
      rootState = wrappedNewState
      console.info( "Store", store.name, "changed." )
      store.hasChanged()
    }
  })

  store.outlet({
    getState() {
      return rootState.get( store.name )
    }
  })

  return storeCursor
}

export function getRootState() {
  return rootState
}
```

Usage example:

_app.js_
```javascript
import Storefront from 'storefront'
import {createState} from './app-state'

export default Storefront.define( 'App', store => {
  let state= createState( store, {
    ready: false
  })

  store.before({

    start( dispatch ) {
      if( state.get( 'ready' )) {
        console.warn( 'Already started!' )
      }
      else {
        console.log( "Starting up..." )
        dispatch()
      }
    }
  })

  store.actions({

    start( action ) {
      console.log( "App startup!", action )
      state= state.set( 'ready', true )
    }

  })

  store.outlets({

    isReady() {
      return state.get( 'ready' )
    }

  })
})
```
