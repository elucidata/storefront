# Development Notebook

> This document is for me to flesh out my thoughts on current or future features in Storefront. You're welcome to read (and comment) but it may only make to sense me.

<!-- toc -->

* [Todos](#todos)
* [Ideas](#ideas)
  * [Validation Custom Events](#validation-custom-events)
  * [ES6 Classes](#es6-classes)
  * [Pass all stores down from top of React component structure?](#pass-all-stores-down-from-top-of-react-component-structure)
  * [Storefront Controller](#storefront-controller)

<!-- toc stop -->


## Todos

- [ ] Support passing custom a `Dispatcher` instance into `configure()`. (For those who prefer Facebook's error throwing dispatcher to Storefront's queued dispatcher.)



## Ideas

### Validation Custom Events

Use custom events for validation error messages?

_stores/auth.js_

```javascript
import Type from 'elucidata-type'

export default Storefront.define( 'Auth', ( mgr)=> {
    validationFailure= mgr.createEvent( 'validation-failure')

    mgr.actions({
        login( dispatch, username, password) {
            if( Type.isEmpty( username)) {
                return validatationFailure( "Username cannot be empty.")
            }
            if( Type.isEmpty( password)) {
                return validatationFailure( "Password cannot be empty.")
            }

            MY_API.login( username, password )
                .then( user => {
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

    validationFailure( msg ) {
        this.setState({ validationMsg: msg })
    },

    formDidSubmit( e ) {
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
            <div className="error">{ this.state.validationMsg }</div>
        )
    }
})
```

---

### ES6 Classes

Support was added for inline classes in action/oulets so you can eliminate those unsightly commas.

```javascript

Storefront.define( "Posts", store => {
    store.actions( class {
        loadPost({ payload:post }) {}
        removePost({ payload:postId }) {}
        updatePost({ payload:post }) {}
    })

    store.outlets( class {
        get( id ) {}
        allTagged( tags ) {}
    })
})

```


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
                {...}
            </Route>
        </Routes>,
        document.body
    )
}

Storefront.
    configure({ useRAF:true }).
    onChange( renderApp )

renderApp()
```

---

### Storefront Controller

An HOC for resolving store data to child component props. Put it at `Storefront.util.Controller`?

Should support usage as an ES7 decorator too.

```javascript
const {Controller}= Storefront.util

@Controller({
    listenTo: [ 'Auth', 'Cart' ],
    resolveProps: {
        loggedInAs( props, Auth, Cart ) {
            return Auth.getLoggedInUser()
        },
        cart( props, Auth, Cart ) {
            return Cart.getState().toJS() // Using Immutable.js?
        }
    }
})
class MyView extends React.Component {
    render() {
        return (
            <div>
                { this.props.loggedInAs }. 
                { this.props.cart.length } items in your cart.
            </div>
        )
    }
}
```
