# Why Another Flux Implementation?

> YAFI <small>Yet Another Flux Implementaion</small>

Good question. 'Cause I suffer from NIH-syndrome.

OK, not really. _Actually_, after working with Flux in a couple of small projects, and about to start a very large one, there are a few things I got tired of managing/dealing with. As such I wanted to build a system that technically supported everything the (quasi) official [Facebook Flux]() version does, but with these rules in mind:

- No need to talk to a dispatcher directly.
- No need to know any dispatchTokens.
- No `switch` blocks of doom.
- No keeping a constants file.
- No need for consumers to require several files to work with a single store: Flux should be an implementation detail, consumers should be able to deal with a Store like a plain object.
- It should provide a top-level aggregated 'change' event.
- The term 'Action Creators' is rather clumsy and too verbose.

Not to be overly negative, there are excellent parts of Flux that are kept:

- Singleton Dispatcher.
- Sequenceable dispatching.
- Synchronicity of dispatching and store updates.

Originally, I really wanted to use ES6 classes for Stores. But I found that closures are nicer from a private-data perspective (internal state is truly hidden from consumers), _and_ from a ease-of-use perspective (code is cleaner looking).

So I wound up with **Storefront**. Terminology-wise, instead of '_Action Creators_' you have '_Clerks_.' '_Stores_' are, well, '_Stores_.' The Dispatcher is hidden under the covers. And there are no constants files.

**Example Store**

Here's a tiny store to illustrate how to use Storefront:

```javascript
var selectionStore= Storefront.define( 'Selection', ( mgr)=> {
    // mgr contains all the methods required to define your store.
    mgr.actions({
        select( dispatch, item) {
            // the dispatch param is provided by Storefront. In this case,
            // it's auto-bound to dispatch the event "Selection_select"
            dispatch{{ item }}
        }
    })

    // Internal State
    var _selectedItem= null

    // Handle the actions
    mgr.handles({
        select( action) {
            _selectedItem= action.payload.item
            mgr.dataHasChanged()
        }
    })

    // Provide some data access methods to consumers
    mgr.provides({
        getSelectedItem() {
            return _selectedItem
        },

        hasSelection() {
            return _selectedItem != null
        }
    })
})
```

The methods available from the example 'selectionStore' are:

```javascript
{ name: 'Selection',
  onNotify: [Function],
  offNotify: [Function],
  onChange: [Function],
  offChange: [Function],
  token: 'nfiptz',
  select: [Function],
  getSelectedItem: [Function],
  hasSelection: [Function] }
```

For more information see [usage.md]() and [api.md]().

[Facebook Flux]: http://facebook.github.io/flux/docs/overview.html
[usage.md]: https://github.com/elucidata/storefront/blob/master/docs/usage.md
[api.md]: https://github.com/elucidata/storefront/blob/master/docs/api.md
