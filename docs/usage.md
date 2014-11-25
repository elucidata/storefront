# Storefront Usage Example

<!-- toc -->

* [AuthStore: Validation with Events](#authstore-validation-with-events)
* [AuthStore: Validation with Promises](#authstore-validation-with-promises)
* [Aggregate OnChange Handler](#aggregate-onchange-handler)

<!-- toc stop -->


## AuthStore: Validation with Events

Example authentication store that uses events to send validation notifications.

_stores/auth.js_
``` javascript
var Storefront= require( 'storefront'),
    type= require( 'elucidata-type'),
    API= require('<your-api-lib>')

module.exports=
Storefront.define( 'Auth', ( mgr)=> {
    var {actions, outlets, dataHasChanged, observes, notify}= mgr,
    userStore= mgr.getStore( 'Users'),
    errorStore= mgr.getStore( 'Errors')

    var authData= getInitialState()

    before({

        login( dispatch, username, password) {
            if( type.isEmpty( username))
                return notify({ valid:false, message:"Username cannot be empty."})
            if( type.isEmpty( password))
                return notify({ valid:false, message:"Password cannot be empty."})

            API.
                authenticate( username, password).
                then(( user)=> {
                    notify({ valid:true })
                    dispatch( user)
                }).
                catch(( err)=> {
                    errorStore.report( err)
                    notify({ valid:false, message:()'API Error: '+ err) })
                })
        }
    })

    actions({

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

    outlets({

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

Consuming validation events:

_views/login-form.jsx_
```javascript
var React= require( 'react'),
    Storefront= require( 'storefront'),
    authStore= require( 'stores/auth')

module.exports=
React.createClass({

    mixins: [ Storefront.mixins.eventHelper ]

    getInitialState() {
        return {
            error: null
        }
    },

    componentDidMount() {
        this.onStoreEvent( authStore, 'notify', this.storeOnNotify)
    },

    storeOnNotify( e) {
        if( e.valid) {
            this.setState({ error:null })
        }
        else {
            this.setState({ error:e.message })
        }
    },

    formOnSubmit( e) {
        e.preventDefault()
        var {user, pass}= this.refs

        authStore.login(
            user.getDOMNode().value,
            pass.getDOMNode().value
        )
    },

    render() {
        return (
            <form onSubmit={this.formOnSubmit}>
                { this.renderError() }
                <input type="text" ref="user" placeholder="Username:"/>
                <input type="password" ref="pass" placeholder="Password:"/>
                <input type="submit" value="Login">
            </form>
        )
    },

    renderError() {
        if( this.state.error == null ) {
            return null
        }
        else {
            return <div className="error">{ this.state.error }</div>
        }
    }
})
```


## AuthStore: Validation with Promises

Example authentication store that uses promises to communicate validation messages.

_stores/auth.js_
``` javascript
var Storefront= require( 'storefront'),
    type= require( 'elucidata-type'),
    API= require('<your-api-lib>')

module.exports=
Storefront.define( 'Auth', ( mgr)=> {
    var {actions, outlets, dataHasChanged, observes, notify}= mgr,
        userStore= mgr.getStore( 'Users'),
        errorStore= mgr.getStore( 'Errors')

    var authData= getInitialState()

    before({

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

    actions({

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

    outlets({

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

Consuming validation promises:

_views/login-form.jsx_
```javascript
var React= require( 'react'),
    Storefront= require( 'storefront'),
    authStore= require( 'stores/auth')

module.exports=
React.createClass({

    getInitialState() {
        return {
            error: null
        }
    },

    formOnSubmit( e) {
        e.preventDefault()
        var {user, pass}= this.refs

        authStore
            .login(
                user.getDOMNode().value,
                pass.getDOMNode().value
            )
            .then(()=>{
                this.setState({ error:null })
            })
            .catch(( err)=>{
                this.setState({ error:err })
            })
    },

    render() {
        return (
            <form onSubmit={this.formOnSubmit}>
                { this.renderError() }
                <input type="text" ref="user" placeholder="Username:"/>
                <input type="password" ref="pass" placeholder="Password:"/>
                <input type="submit" value="Login">
            </form>
        )
    },

    renderError() {
        if( this.state.error == null ) {
            return null
        }
        else {
            return <div className="error">{ this.state.error }</div>
        }
    }
})
```


## Aggregate OnChange Handler

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

// By default this will batch up multiple store onChange events and
// schedule the global onChange using requestAnimationFrame.
Storefront.onChange( renderApp)

renderApp()
```
