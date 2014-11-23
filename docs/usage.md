# Storefront Usage Example


_stores/auth/auth-clerk.js_
``` javascript
var Storefront= require( 'storefront'),
    type= require( 'elucidata-type'),
    API= require('<your-api-lib>')

module.exports=
Storefront.Clerk( 'Auth', ( mgr)=> {

    mgr.actions({

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
                        // Possibly you want to dispatch a custom event?
                        dispatch.send( 'custom_event', { error:err })
                        // In general, I'd avoid this pattern. It's an escape
                        // hatch for emergency use only.

                        // In this example, I'd actually have an ErrorStore
                        // that logged all the errors in the app, and call it
                        // like this:
                        require( 'stores/error').report( err)
                        // It would do whatever it wanted and dispatch its own
                        // actions to handle it.
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
Storefront.Store( 'Auth', ( mgr)=> {
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

module.exports=
Storefront.Facade( 'Auth')
```

In your top-level view controller you can listen for an aggregate change event from Storefront like this:

_main/routes.jsx_
``` javascript
var Storefront= require( 'storefront'),
    React= require( 'react/addons'),
    {Route}= require( 'react-router')

function renderApp() {
    React.render(
        <Route path="/"/>, // Whatever your routes are...
        document.body
    )
}

Storefront.onChange( renderApp)

renderApp()
```
