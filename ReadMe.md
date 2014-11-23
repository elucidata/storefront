# Storefront

Weighing in at < 5 kB, **Storefront** is a simple flux implementation that supports all the primary elements of [Facebook's flux pattern](https://facebook.github.io/flux/). Here are the main differences:

- Metaphors are slightly different.
- No separate constants file to manage event names.
- Makes the dispatcher an internal detail that consumers don't worry about. (No dispatcherToken[^1])
- Encapsulates all the Flux details within the store module, exposing only operational methods (queries and actions).

**Storefront Metaphors**

- **Clerks** are responsible for dispatching actions and handling any async (api) operations before sending to the dispatcher.
- **Stores** handle the clerk actions, manage and provide access to the internal data structure(s), and send notifications when said data has changed.


## Docs

- [API](docs/api.md)
- [Usage Example](docs/usage.md)

## Overview

For an idea how it all works, here's a skeleton authentication Storefront.

Starting with the Clerk, let's rough out what actions are available to operate on the AuthStore:

_stores/auth/auth-clerk.js_ [^2]
```javascript
var Storefront= require( 'storefront')

module.exports=
Storefront.defineClerk( 'Auth', ( mgr)=>{

    mgr.actions({

        login( dispatch, username, password) {
            // Impl not shown here, see docs/usage.md
        },

        logout( dispatch) {
            // Under the covers it's dispatching the event: "Auth_logout"
            dispatch({})
        }
    })
})
```

So the method names we chose (`login` and `logout`) become the _actions_ that the Store will handle. You'll notice that each action defines an initial param of `dispatch`, this is a function provided by Storefront that's autobound to the appropriate action name so that you don't have to deal with some extraneous constants file. See [docs/api.md](./docs/api.md) for more.

Let's setup the Store to handle those actions, and while we're there, we'll add some methods that other Stores and Views can query:

_stores/auth/auth-store.js_
```javascript
var Storefront= require( 'storefront')

module.exports=
Storefront.defineStore( 'Auth', ( mgr)=>{

    mgr.handles({

        login( action) {
            // This is called when "Auth_login" is dispatched
        },

        logout( action) {
            // This is called when "Auth_logout" is dispatched
        }
    })

    mgr.provides({

        isAuthenticated() {
        },

        currentUser() {
        }
    })
})
```

I like to leverage a CommonJS module pattern for loading stores, so I'll add this:

_stores/auth/index.js_
```javascript
var Storefront= require( 'storefront'),
    // Make sure we load the Clerk and Store
    require( './auth-clerk'),
    require( './auth-store')

module.exports= Storefront.get( 'Auth')
```

At its simplest, that's it.

> For the full example code with a demonstration of how I prefer to handle input validation in Storefront (spoilers: Promises), how to `waitFor` other stores, and more see [docs/usage.md](./docs/usage.md)

We can now consume a Storefront like this:

_views/some-view.jsx_
```javascript
// All the Flux infrastructure is encapsulated and hidden within
// the store itself, the facade becomes your single reference
// point for the AuthStore
var authStore= require( 'stores/auth')

// Then query some data...

if( authStore.isAuthenticated() ) {
    var user= authStore.currentUser()
}

// Or trigger an action...

actionLoginClick( e) {
    authStore.login()
}
```

---

We don't have to use separate files for the clerk/store/index... We can do it all in one pass too:

```javascript
var Storefront= require( 'storefront')

var AuthStore= Storefront.define( 'Auth', (mgr)=>{

    mgr.actions({
        login( dispatch, username, password) { },
        logout( dispatch) {}
    })

    mgr.handles({
        login( action) {},
        logout( action) {}
    })

    mgr.provides({
        isAuthenticated() {},
        currentUser() {}
    })

})

```




## ES5 vs ES6 Styles...

I use ES6 syntax in all my javascript files for consistency, but it's not required to use Storefront, just change the method calls to the more old-school style:

```javascript
Storefront.defineClerk( 'Project', function( mgr){
    mgr.actions({
        addProject: function( dispatch, projectData) {
            // Validate projectData...
            dispatch({ data:projectData })
        }
    })
})
```

[^1]: OK, technically there _is_ a dispatcher token, but it's internalized in such a way that you'll never need to use it.

[^2]: You don't have to use this naming/folder structure, it's just my preferences.

## License

The MIT License (MIT)

Copyright (c) 2014 Elucidata unLTD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
