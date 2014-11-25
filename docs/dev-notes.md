# Development Notebook

> This document is for me to flesh out my thoughts on current or future features in Storefront. You're welcome to read (and comment) but it may only make to sense me.

## To-Do

- [ ] Add `.dispose()` method to runtime.


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
    authStore: require( 'stores/auth'),
    userStore: require( 'stores/users'),
    projectStore: require( 'stores/projects'),
    taskStore: require( 'stores/tasks'),
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

Storefront.
    configure({ useRAF:true }).
    onChange( renderApp)

renderApp()
```

What is gained by this?

---

> Auto-generate actions?

Can/should we auto-generate actions? I think actions are good for handling async calls before dispatching... But for simple actions it's just boilerplate. And boilerplate should be generated, if possible!

What might this look like?

When/how would the generation occur? As multiple `define` calls actually merge Store definitions, they are never really closed. As such, when would Storefront know when an action was 'missing?'

Perhaps it auto-stubs the action as soon as the `handles` function is called, if the action is missing. It would have to be marked as 'overwritable' so actions won't throw an Error if the instance prop already exists.

Simple CRUD pattern:

```javascript
Storefront.define( 'User', ( mgr)=> {

    var _users= []

    inlets({ // handles/actions in one
        add( action) {
            if(! isValid( action.payload)) return
            _users.push( action.payload)
            mgr.hasChanged()
        },
        remove( action) {
            var len= _users.length
            _users= _users.
                filter((u)=> u.id !== action.payload.id)
            if( len !== _users.length)
                mgr.hasChanged()
        },
        update( action) {
            _users= _users.
                filter((u)=> u.id === action.payload.id).
                forEach((u)=>{
                    merge(u, action.payload)
                    mgr.hasChanged()
                })
        }
    })

    outlets({ // provides
        all() {
            return _users
        },
        get( id) {
            return _users.
                filter(( u)=> u.id === id)[ 0]
        }
    })

    // Could still listen to other stores...
    observes( 'Auth', {
        logout( action) {
            _users= []
            mgr.hasChanged()
        }
    })
})
```
