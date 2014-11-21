# Storefront

Property | Description
--- | ---
`_internals` | Instance of `Runtime`

---

### `Storefront.Clerk( storeName, factoryFn)`
Defines and returns a `Clerk` instance using `factoryFn`.

`factoryFn` will get called with a Clerk Manager (see below):

**Clerk Manager**

#### `clerkMgr.actions( methodsObj)`

---

### `Storefront.Store( storeName, factoryFn)`
Defines and returns a `Store` instance using `factoryFn`.

`factoryFn` will get called with a Store Manager (see below):

**Store Manager**

#### `storeMgr.getClerk()`

Probably not a good idea to call this in the root of your factory, the Clerk may not be defined yet.

#### `storeMgr.handle( methodsObj)`

#### `storeMgr.observe( otherStore, methodsObj)`

#### `storeMgr.provide( methodsObj)`

#### `storeMgr.waitFor( ...stores)`

#### `storeMgr.dataDidChange()`

Aliases: `hasChanged()`

#### `storeMgr.notify( message)`

---

### `Storefront.Facade( storeName, factoryFn)`
Defines and returns a `Facade` instance using `factoryFn`.

`factoryFn` will get called with a Facade Manager (see below):

**Facade Manager**


### `Storefront.onChange( fn)`
Aggregate event. Will fire once with an array of all change events that were triggered in a single dispatch cycle.

### `Storefront.offChange( fn)`

## `Runtime`

Property | Description
--- | ---
`dispatcher` | Singleton dispatcher
`registry` | Contains all the store/clerk/facade instances

### `getInstance( type, storeName)`

### `reset( storeName)`
> Not implemented yet

Re-initializes Store to default state.
