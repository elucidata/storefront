# Boilerplate Code Generation

Personally, I set up [scaffolt](https://github.com/paulmillr/scaffolt) to generate the boilerplate code for me. The template files look like this[^1]:

_generate.json_
```json
{
  "files": [
    {
      "from": "index.js.hbs",
      "to": "app/stores/{{name}}/index.js"
    },
    {
      "from": "store.js.hbs",
      "to": "app/stores/{{name}}/{{name}}-store.js"
    },
    {
      "from": "clerk.js.hbs",
      "to": "app/stores/{{name}}/{{name}}-clerk.js"
    }
  ],
  "dependencies": []
}
```

_index.js.hbs_
```javascript
/**
 * {{#camelize}}{{name}}{{/camelize}} Storefront
 */
var Storefront= require( 'storefront')

require( './{{name}}-clerk')
require( './{{name}}-store')

module.exports= Storefront.get( '{{#camelize}}{{name}}{{/camelize}}')
```

_clerk.js.hbs_
```javascript
/**
 * {{#camelize}}{{name}}{{/camelize}} Clerk
 */
var Storefront= require( 'storefront')

module.exports=
Storefront.defineClerk( '{{#camelize}}{{name}}{{/camelize}}', ( mgr)=> {
    mgr.actions({
        example( dispatch, param) {
            if(! param) return Promise.reject("Invalid param")

            return new Promise(( resolve, reject)=>{
                // Do any API calls here. If it returns/throws an error...
                // reject( errorReason )

                resolve() // A notification of validation, not completion.

                // Everything is synchronous from this point on...
                dispatch({ param })
            })
        }
    })
})
```

_store.js.hbs_
```javascript
/**
 * {{#camelize}}{{name}}{{/camelize}} Store
 */
var Storefront= require( 'storefront')

module.exports=
Storefront.defineStore( '{{#camelize}}{{name}}{{/camelize}}', ( mgr)=> {

    // Internal data, initialized to default state
    var data= null

    // Handle the Clerk actions
    mgr.handles({
        example( action) {
            data= action.payload.param
            mgr.dataHasChanged()
        }
    })

    // Provide query methods to Views
    mgr.provides({
        getExampleData() {
            return data
        }
    })
})
```


[^1]: I'll extract this into a separate repo at some point. Unfortunately, scaffolt doesn't support templates from npm (shame, really), so you'll need to integrate this into your actual app's file structure.
