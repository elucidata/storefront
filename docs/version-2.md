# Notes for Storefront 2

* Designed with ES* and decorators in mind!

**Example**

_flux.js_
```javascript
import Storefront from 'storefront'

const instance= new Storefront({
    // Options here...
})

export default instance
```

_TodoActions.js_
```javascript
import {Actions, utility} from './flux'

@Actions({
    generate: [ 'addItem', 'removeItem' ]
})
export default class TodoActions {
    @utility
    load() { // This is a 'util' that's exposed, not a proper action.
        return fetch( URL )
            .then( JSON.parse )
            .then( items => {
                items.forEach( item => {
                    this.addItem( item )
                })
                // dispatch({ items })
                return items
            })
            .catch( err => {
                console.log( 'Fetch error:', err )
                return err
            })
    }
}
```

_TodoStore.js_
```javascript
import {Store, accessor, mutator} from './flux'
import TodoActions from './TodoActions'

@Store({
    eventStyle: 'coalesce', // or immediate?
    immutable: false,
    exposes: TodoActions // Allow binding of actions to stores...
})
export default class TodoStore {
    state= {
        all: []
    }

    @accessor
    getAll() {
        return this.state.all
    }

    @accessor
    get( id ) {
        return this.state.all.filter( item => {
            return item.id === id
        })[ 0 ]
    }

    @mutator( TodoActions.addItem )
    addItem({ payload:item }) {
        item.id = item.id || this.nextId()
        this.state.all.push( item )
    }

    @mutator( TodoActions.removeItem )
    removeItem({ payload:item }) {
        this.state.all= this.state.all.filter( todo => {
            return todo.id !== item.id
        })
    }

    // Not exposed publicly, but still accessible via `this` in other methods
    nextId() {
        return this.state.all.length + 1
    }
}
```

Using the `exposes: TodoActions` configuration, it'll automatically bind the actions to the store so you can use it like this:

```javascript
import TodoStore from './TodoStore'

TodoStore.getAll().length //= 0

TodoStore.addItem({ name:'Test' })

TodoStore.getAll().length //= 1
```

## Smartly Dumb Components

In your React component:

_TodoItem.js_
```javascript
import {Controller} from './flux'
import TodoStore from './TodoStore'

@Controller({
    listenTo: TodoStore,
    recycle: true,
    props: {
        todo( props ) {
            return TodoStore.get( props.id )
        }
    }
})
export default class TodoItem extends React.Component {

    render() {
        return (
            <div>
                { this.props.todo.name }
            </div>
        )
    }
}
```

If `TodoItem` is used like this:

```
<TodoItem id="1"/>
```

The Controller will use the Store to fetch the `todo` and pass it on to the component.

However, if it's used like this:

```
<TodoItem todo={ todoItem }/>
```

Then the Controller isn't engaged, and the prop is passed directly to the component.

> **Note:** The `recycle` flag tells the Controller to assign a unique key to the child component that change whenever any prop or associated Store changes. Thereby forcing a full component recycle (unmount/mount) instead of an update (willUpdate).

**Thoughts/Ideas**

* Maybe the Controller should be called something else? "Controller" is a more-than-a-little overloaded term. But what? Resolver? PropResolver?


## Support for Immutable in Core?

```javascript
import Storefront from 'storefront'

export default new Storefront({
    immutable: true
})
```

It would be nice if the Store API is the same regardless of mutability...

```javascript
@Store()
class AuthStore {

    @mutator( AuthActions.loggedIn )
    doLogin( action ) {
        const {payload:{ user }}
        this.setState({
            user: user,
            loggedIn: true
        })
    }

    @accessor
    isLoggedIn() {
        return this.getState().loggedIn
    }
}
```

Different state mutation methods?

```javascript
this.setState( object ) // Replaces
this.updateState( path, object ) // Merges
```

Based on React `update` or ImmutableJS?


## Different Env Settings

_flux.js_
```javascript
import Storefront from 'storefront'

let instance= null

if( process.env === 'development') {
    instance= new Storefront({
        verbose: true
    })
}
else if( process.env === 'test') {
    instance= new Storefront({
        testMode: true // ???
        dispatcher: MyMockDispatcher
    })
}
else {
    instance= new Storefront({

    })
}

export default instance
```
