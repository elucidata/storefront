# Development Notebook

> This document is for me to flesh out my thoughts on current or future features in Storefront. You're welcome to read (and comment) but it may only make to sense me.

<!-- toc -->

* [To-Do](#to-do)
* [Ideas](#ideas)
  * [Validation Custom Events](#validation-custom-events)
  * [Alternate Names](#alternate-names)
  * [ES6 Classes?](#es6-classes)
  * [Pass all stores down from top of React component structure?](#pass-all-stores-down-from-top-of-react-component-structure)

<!-- toc stop -->


## To-Do

- [ ] Add `.dispose()` method to runtime.
- [ ] Add `.version` to runtime.


## Ideas

### Validation Custom Events

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

### Alternate Names

> `inlets`/`outlets` vs `handles`/`provides`?

```javascript
Storefront.define( 'Timer', (mgr)=>{
    var {inlets, outlets, dataDidChange}= mgr

    var _timer= false

    // user/consumer calls these methods to trigger data changes/actions
    inlets({
        // alias of .handles()
        start( action) {
            _timer= true
            dataDidChange()
        },
        stop( action) {
            _timer= false
            dataDidChange()
        }
    })

    // user/consumer calls these methods to retreive/query data
    outlets({
        // alias of .provides()
        isRunning() {
            return _timer
        }
    })
})
```
_Meh_. How about:

---

> `actions` instead of `handles`, `before` instead of `actions`?

```javascript
Storefront.define( "Timer", ( mgr)=> {
    var {actions, before, outlets, dataHasChanged}= mgr

    before({
        stop( dispatch) {
            // Only dispatch 'stop' if the timer is running.
            if( _timer) {
                dispatch()
            }
        }
    })

    actions({
        start( action) {
            _timer= true
            dataHasChanged()
        },
        stop( action) {
            _timer= false
            dataHasChanged()
        }
    })

    outlets({
        isRunning() {
            return _timer
        }
    })
})
```

Hmmm... I kinda like that.

---

### ES6 Classes?

```javascript

var manager;

var _state= Store.initialState()

class Actions {
    add( dispatch, title) {
        dispatch({ title })
    }
}

class Store {

    add( action) {
        _state.posts.push( action.payload)
        manager.dataHasChanged()
    }

    static initialState() {
        return {
            posts: []
        }
    }
}

Storefront.define( "Posts", (mgr)=> {
    manager= mgr

    actions( new Actions)
    handles( new Store)
})

```

Why bother?

---

### Pass all stores down from top of React component structure?

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
