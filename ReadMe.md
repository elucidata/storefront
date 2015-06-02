# Storefront

Weighing in at ~6kB, **Storefront** is a simple flux implementation that supports all the primary elements of [Facebook's flux pattern](https://facebook.github.io/flux/). Here are the main differences:

- No separate constants file to manage event names.
- Makes the dispatcher an internal detail that consumers don't worry about. (No dispatcherToken<sup>1</sup>)
- Encapsulates all the Flux details within a single module, exposing only operational methods (queries and actions).


## Docs

- [API](docs/api.md)
- [Usage Example](docs/usage.md)

Example project on GitHub: [github.com/elucidata/storefront-example](https://github.com/elucidata/storefront-example)


## Quick Start

Via **npm**:

    npm install --save storefront

Or via **bower**:

    bower install storefront

Or straight from **github**:

> [dist/storefront.min.js](https://raw.githubusercontent.com/elucidata/storefront/master/dist/storefront.min.js)

## Overview

For an idea of how it all works, here's a skeleton store for app authentication:

_stores/auth.js_
```javascript
import Storefront from 'storefront'

export default Storefront.define( 'Auth', store => {
    // Internal state.
    let _loggedIn= false

    // The following actions, login/logout, will have
    // 'action creators' automatically generated.
    store.actions({

        login( action) {
            if( authenticate( action.payload)) {
                _loggedIn= true
            }
            else {
                _loggedIn= false
            }
            // notify listeners that the internal state has changed
            store.hasChanged()
        },

        logout( action) {
            _loggedIn= false
            store.hasChanged()
        }
    })

    // Methods for querying state are defined as 'outlets'
    store.outlets({

        isLoggedIn() {
            return _loggedIn
        }
    })
})
```

At its simplest, that's it.

> For the full example code with a demonstration of how to handle input validation in Storefront (via Promises or Events), how to `waitFor` other stores, and more see [docs/usage.md](./docs/usage.md)

You can now use the store as a simple object:

```javascript
// get by name or require( 'stores/auth'), whichever you prefer.
const authStore= Storefront.get( 'Auth')

if(! authStore.isLoggedIn()) {
    authStore.login('username', 'password')
}
```

So the method names we chose in the `actions` block (`login` and `logout`) will have so-called "Action Creator" functions automatically created using the same name. But you can write your own dispatching function by defining it in a `before` block like this:

```javascript
Storefront.define( 'Auth', store => {

    store.before({

        // If we need to do something async, it's better to do it here,
        // before it's been dispatched...
        login( dispatch, username, password) {
            myApi.authenticate( username, passord)
                .then( user =>{
                    // The 'dispatch' param is a function that's
                    // pre-bound to the correct action event name,
                    // you just call it with your payload:
                    dispatch( user)
                })
                .catch( err =>{
                    // Maybe you have a central api error store?
                    store.get( 'Errors').report( err)
                })

        }
    })

    // rest of code from above goes here...
})
```

See [docs/api.md](./docs/api.md) for more.


## ES5 vs ES6 Styles...

I use ES6 syntax in all my javascript files for consistency, but it's not required to use Storefront, just change the method calls to the more old-school style:

```javascript
Storefront.define( 'Project', function( store){
    store.actions({
        addProject: function( action) {
            // ...
        }
    })
})
```


## License

The MIT License (MIT)

Copyright (c) 2014-2015 Elucidata unLTD

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

---

1. OK, technically there _is_ a dispatcher token, but it's internalized in such a way that you'll never need to use it.

---

[![browser support](https://ci.testling.com/elucidata/storefront.png)
](https://ci.testling.com/elucidata/storefront)
