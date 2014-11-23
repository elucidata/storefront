# Development Notebook

> This document is for me to flesh out my thoughts on current or future features in Storefront. You're welcome to read (and comment) but it may only make to sense me.


## ToDo

- [ ] Add support for renderAnimationFrame onChange batching
- [ ] Add config option for toggling `nextTick` in dispatching
- [ ] Support `notify()` in the clerk manager


## Questions

- Should multiple calls to `Store` (or `Clerk`) throw an Error? Currently it merges all calls into single instance.

xw
## Ideas

> Validation Events

Use custom events for validation error messages?

_stores/auth.js_

```javascript
var type= require( 'elucidata-type')

module.exports=
Storefront.define( 'Auth', ( mgr)=> {
    validationFailure= mgr.createEvent( 'validation-failure')

    mgr.actions({
        login( dispatch, username, password) {
            if( type.isEmpty( username)) {
                return validatationFailure( "Username cannot be empty.")
            }
            if( type.isEmpty( password)) {
                return validatationFailure( "Password cannot be empty.")
            }

            MY_API.login( username, password).then(( user)=> {
                dispatch({ user })
            })
        }
    })
})
```

_views/whatever.js_

```javascript
var authStore= require('stores/auth')

module.exports=
React.createClass({

    mixins:[ Storefront.mixins.eventHelper ],

    getInitialState() {
        return {
            validationMsg: null
        }
    },

    componentDidMount() {
        // This will be automatically cleaned up thanks to the
        // Storefront.mixins.eventHelper
        this.onStoreEvent(
            authStore,
            'validation-failure',
            this.validationFailure
        )
    },

    validationFailure( msg) {
        this.setState({ validationMsg: msg })
    },

    formDidSubmit( e) {
        e.preventDefault()
        this.setState({ validationMsg:null })
        var {user, pass}= this.refs
        authStore.login(
            user.getDOMNode().value,
            pass.getDOMNode().value
        )
    },

    render() {
        return (
            <form onSubmit={ this.form.didSubmit }>
                { this.renderValidationMsg() }
                <input type="text" ref="user" placeholder="Username" autoFocus/>
                <input type="password" ref="pass" placeholder="Password" />
            </form>
        )
    },

    renderValidationMsg() {
        if( this.state.validationMsg == null) return null

        return (
            <div className="error">{ this.state.validationMsg}</div>
        )
    }
})
```

---

> Pass all stores down from top of React component structure?


```javascript

var stores= {
    auth: require( 'stores/auth'),
    users: require( 'stores/users'),
    projects: require( 'stores/projects'),
    tasks: require( 'stores/tasks'),
}

function renderApp() {
    React.render(
        <Routes>
            <Route name="root" path="/" {...stores} handler={...}>
                <Route name="login" {...stores} handler={...}/>
            </Route>
        </Routes>,
        document.body
    )
}

Storefront.onChange( renderApp)
renderApp()
```

What is gained by this?
