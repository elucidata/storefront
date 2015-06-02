import Storefront from '../../index'
import test from 'tape'

const rt = Storefront.newInstance({ asyncDispatch: false, useRAF: false, logging:false, verbose: false })

test( 'Defining Actions:', main => {

  main.test( ' -> with object literals', is => {
    is.plan( 2 )

    let store= rt.define( 'Test1', store => {
      store.actions({
        doThis() {
          is.pass( 'defined action was called' )
        }
      })
    })

    is.equal( typeof store.doThis, 'function', 'defined action' )

    store.doThis()
  })

  main.test( ' -> with classes', is => {
    is.plan( 2 )

    let store= rt.define( 'Test1', store => {
      store.actions( class {
        doThat() {
          is.pass('defined action was called')
        }
      })
    })

    is.equal( typeof store.doThat, 'function', 'defined action' )

    store.doThat()
  })

  main.end()
})
