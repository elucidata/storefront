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
- It should generate as much boilerplate code as it can.
- Also, the term 'Action Creators' is rather clumsy and too verbose.

Not to seem negative, there are excellent parts of Flux that I wanted to be sure to keep:

- General flow.
- ~~Singleton Dispatcher~~ Shared dispatcher per Runtime instance.
- Sequenceable dispatching.
- Synchronicity of dispatching and store updates.

Originally, I wanted to use ES6 classes for Stores. But it turns out that closures are nicer from a private-data perspective (internal state is truly hidden from consumers), _and_ from a ease-of-use perspective (code is cleaner looking).

So I wound up with **Storefront**.

Terminology-wise, instead of _Action Creators_, _Action Events_ (usually in a constants files somewhere), _Actions_, _Dispatcher_, and _Stores_, you have _Stores_ that define _Actions_ and _Outlets_. The other things are all there, in one form or another, under the covers.


**Example Store**

Here's a tiny store to illustrate how to use Storefront:

```javascript
var selectionStore= Storefront.define( 'Selection', ( mgr)=> {
    // mgr contains all the methods required to define your store.
    var {actions, outlets, dataHasChanged}= mgr

    // Internal State
    var _selectedItem= null

    // Handle the actions
    actions({
        select( action) {
            _selectedItem= action.payload.item
            dataHasChanged()
        }
    })

    // Provide some data access methods to consumers
    outlets({
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
