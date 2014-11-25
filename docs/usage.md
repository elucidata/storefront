# Storefront Usage Example

<!-- toc -->

* [Separate Clerk/Store Files](#separate-clerkstore-files)
* [Single Store File](#single-store-file)

<!-- toc stop -->


## Separate Clerk/Store Files

_stores/auth/auth-clerk.js_
``` javascript
var Storefront= require( 'storefront'),
    type= require( 'elucidata-type'),
    API= require('<your-api-lib>')

module.exports=
Storefront.defineClerk( 'Auth', ( mgr)=> {
    var {actions}= mgr

    actions({

        login( dispatch, username, password) {
            if( type.isEmpty( username))
                return Promise.reject( "Username cannot be empty.")
            if( type.isEmpty( password))
                return Promise.reject( "Password cannot be empty.")

            return new Promise(( resolve, reject)=>{
                // call your api, whatever it is...
                API.
                    authenticate( username, password).
                    then(( user)=> {
                        resolve()
                        dispatch( user)
                    }).
                    catch(( err)=> {
                        reject( err)
                        // You could have an ErrorStore that logged all the
                        // errors in the app, and call it like this:
                        require( 'stores/error').report( err)
                        // Or this:
                        mgr.getStore( 'Errors').report( err)
                    })
            })
        },

        logout( dispatch) {
            dispatch()
        }
    })
})
```

_stores/auth/auth-store.js_
``` javascript
var Storefront= require( 'storefront'),
    userStore= require( 'stores/user')

function getInitialState() {
    return {
        authenticated: false,
        authenticatedAt: null,
        currentUser: null
    }
}

module.exports=
Storefront.defineStore( 'Auth', ( mgr)=> {
    var authData= getInitialState()

    mgr.handles({

        login( action) {
            authData= {
                authenticated: true,
                authenticatedAt: new Date(),
                currentUser: action.payload
            }
            mgr.dataHasChanged()
        },

        logout( action) {
            authData= getInitialState()
            mgr.notify( 'You have been logged out.')
            mgr.dataHasChanged()
        }
    })

    mgr.observes( userStore, {

        remove( action) {
            if( !authData.authenticated) return
            if( action.payload.id !== authData.currentUser.id) return

            mgr.waitFor( userStore)

            if( userStore.get( authData.currentUser.id) === null ) {
                mgr.getClerk().logout()
            }
        }
    })

    mgr.provides({

        isAuthenticated() {
            return authData.authenticated
        },

        authenticatedAt() {
            return authData.authenticatedAt
        },

        currentUser() {
            return Object.create( authData.currentUser)
        }
    })
})
```

_stores/auth/index.js_
``` javascript
var Storefront= require( 'storefront'),
    require('./auth-clerk'),
    require('./auth-store')

module.exports= Storefront.get( 'Auth')
```

In your top-level view controller you can listen for an aggregate change event from Storefront like this:

_main/routes.jsx_
``` javascript
var Storefront= require( 'storefront'),
    React= require( 'react/addons'),
    {Route}= require( 'react-router'),
    authStore= require( 'stores/auth')

function renderApp() {
    React.render(
        <Route path="/" {authStore}/>, // Whatever your routes are...
        document.body
    )
}

Storefront.onChange( renderApp)

renderApp()
```

---

## Single Store File

_stores/auth.js_
``` javascript
var Storefront= require( 'storefront'),
    type= require( 'elucidata-type'),
    API= require('<your-api-lib>')

module.exports=
Storefront.define( 'Auth', ( mgr)=> {
    var {actions, handlers, dataHasChanged, provides, observes, notify}= mgr,
        userStore= mgr.getStore( 'Users'),
        errorStore= mgr.getStore( 'Errors')

    var authData= getInitialState()

    actions({

        login( dispatch, username, password) {
            if( type.isEmpty( username))
                return Promise.reject( "Username cannot be empty.")
            if( type.isEmpty( password))
                return Promise.reject( "Password cannot be empty.")

            return new Promise(( resolve, reject)=>{
                // call your api, whatever it is...
                API.
                    authenticate( username, password).
                    then(( user)=> {
                        resolve()
                        dispatch( user)
                    }).
                    catch(( err)=> {
                        reject( err)
                        errorStore.report( err)
                    })
            })
        }
    })

    handles({

        login( action) {
            authData= {
                authenticated: true,
                authenticatedAt: new Date(),
                currentUser: action.payload
            }
            dataHasChanged()
        },

        // An action for this handler will be automatically created...
        logout( action) {
            authData= getInitialState()
            notify( 'You have been logged out.')
            dataHasChanged()
        }
    })

    observes( userStore, {

        remove( action) {
            if( !authData.authenticated) return
            if( action.payload.id !== authData.currentUser.id) return

            mgr.waitFor( userStore)

            if( userStore.get( authData.currentUser.id) === null ) {
                mgr.getClerk().logout()
            }
        }
    })

    provides({

        isAuthenticated() {
            return authData.authenticated
        },

        authenticatedAt() {
            return authData.authenticatedAt
        },

        currentUser() {
            return Object.create( authData.currentUser)
        }
    })

    function getInitialState() {
        return {
            authenticated: false,
            authenticatedAt: null,
            currentUser: null
        }
    }

})
```

Usage is the same:

_main/routes.jsx_
``` javascript
var Storefront= require( 'storefront'),
    React= require( 'react/addons'),
    {Route}= require( 'react-router'),
    authStore= require( 'stores/auth')

function renderApp() {
    React.render(
        <Route path="/" {authStore}/>, // Whatever your routes are...
        document.body
        )
    }

Storefront.onChange( renderApp)

renderApp()
```
