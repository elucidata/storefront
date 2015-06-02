import Storefront from '../../index'
import test from 'tape'

const rt = Storefront.newInstance({ asyncDispatch: false, useRAF: false, logging:false, verbose: false })

test( 'Defining Stores:', main => {

  main.test( ' -> with builder function', is => {
    let store = rt.define( 'TestStoreA', store => {
      let value= 'Yep'
      store.outlets({
        getValue: () => value
      })
      return { value }
    })
    is.equal( store.value, 'Yep', 'returned value from builder')
    is.ok( rt.hasStore('TestStoreA'), 'defined named store')
    is.equal( rt.get('TestStoreA').value, 'Yep', 'returned value from builder')
    is.equal( rt.get('TestStoreA').getValue(), 'Yep', 'returned value from outlet')
    is.end()
  })

  main.test( ' -> with builder object', is => {
    // No actions are defined for object builders, only outlets!
    let store = rt.define( 'TestStoreB', {
      getValue: () => 'Yep',
      value: 'Yep'
    })
    is.equal( store.value, 'Yep', 'returned value from builder')
    is.ok( rt.hasStore('TestStoreB'), 'defined named store')
    is.equal( rt.get('TestStoreB').value, 'Yep', 'returned value from builder')
    is.equal( rt.get('TestStoreB').getValue(), 'Yep', 'returned value from outlet')

    // Move this to an 'internal' test
    //is.equal( Object.keys( rt.getManager('TestStoreB')._handlers).length, 0, 'No events created for object builder')
    is.end()
  })

  main.end()
})
