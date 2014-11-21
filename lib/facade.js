var type= require('elucidata-type'),
    alias= require('./alias'),
    ensure= require('./ensure')


  function Storefront(name) {"use strict";
    this.name= name
  }


function Facade(runtime, name, builder) {
  var clerk= runtime.getInstance( 'clerk', name),
      store= runtime.getInstance( 'store', name),
      storeFront= new Storefront( name),
      manager= {
        exposes:function( methodsObj) {
          Object.
            keys( methodsObj).
            forEach(function( key){
              storeFront[ key]= methodsObj[ key]
            })
        }
      },
      returnValue

  ensure( clerk && store, "A Store and Clerk are required to create a facade for: "+ name)

  alias( manager, 'exposes', 'expose', 'public')

  if( type.isFunction( builder)) {
    returnValue= builder( manager)
  }
  else {
    returnValue= builder
  }

  if( type.isObject( returnValue)) {
    manager.exposes( returnValue)
  }

  storeFront= Object.merge( storeFront, clerk)
  storeFront= Object.merge( storeFront, store)

  return Object.freeze( storeFront)
}

module.exports= Facade
