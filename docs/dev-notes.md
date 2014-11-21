# Development Notebook

> This document is for me to flesh out my thoughts on current or future features in Storefront. You're welcome to read (and comment) but it may only make to sense me.


## ToDo

- [x] Build browser version for use in bower
- [x] Add bower.json
- [ ] Add tests
- [ ] Add support for renderAnimationFrame onChange batching
- [ ] Better API docs


## Ideas

For simple stores, how about a composite factory?

```javascript
var TodoStore= Storefront.define( 'Todo', ( mgr)=>{

    var todos=[]

    mgr.actions({
        addTodo( dispatch, text) {
            if( text) {
                dispatch({ text })
            }
        }
    })

    mgr.handles({
        addTodo( action) {
            var {text}= action.payload
            todo.push( text)
        }
    })

    mgr.provides({
        getAllTodos() {
            return todos
        }
    })

})
// TodoStore == {
//     name: 'Todo',
//     addTodo: <function>,
//     getAllTodos: <function>,
//     onChange: <function>,
//     offChange: <function>,
//     onNotify: <function>,
//     offNotify: <function>
// }
```
