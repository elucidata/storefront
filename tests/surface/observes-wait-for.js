import Storefront from '../../index'
import test from 'tape'

test( 'Store obervation:', main => {

  main.test( ' -> observing instances', is => {
    let rt= Storefront.newInstance({
       asyncDispatch: false, useRAF: false
    })

    const store1 = rt.define( store => {
      let data= null
      store.actions({
        load({ payload }) {
          data= payload
          store.hasChanged()
        }
      })
      store.outlets({
        getData: () => data
      })
    })

    const store2 = rt.define( store => {
      let store1_data= null
      store.observes( store1, {
        load({ payload }) {
          store.waitFor( store1 )
          // store1_data= payload
          store1_data= store1.getData()
          store.hasChanged()
        }
      })
      store.outlets({
        getData: () => store1_data
      })
    })

    is.equal( store1.getData(), null, 'Initial state is set.')
    let msg = "mange une orange"

    store1.load( msg )
    is.equal( store1.getData(), msg, 'Updated state is set.')

    is.equal( store2.getData(), msg, 'Second store state is set from first store.')

    is.end()
  })

  main.test( ' -> observing by name', is => {

    let rt= Storefront.newInstance({
       asyncDispatch: false, useRAF: false
    })

    const store1 = rt.define( 'Store1', store => {
      let data= null
      store.actions({
        load({ payload }) {
          data= payload
          store.hasChanged()
        }
      })
      store.outlets({
        getData: () => data
      })
    })

    const store2 = rt.define( 'Store2', store => {
      let store1_data= null
      store.observes( 'Store1', {
        load({ payload }) {
          store.waitFor( 'Store1' )
          // store1_data= payload
          store1_data= store.get('Store1').getData()
          store.hasChanged()
        }
      })
      store.outlets({
        getData: () => store1_data
      })
    })

    is.equal( store1.getData(), null, 'Initial state is set.')
    let msg = "mange une orange"

    store1.load( msg )
    is.equal( store1.getData(), msg, 'Updated state is set.')

    is.equal( store2.getData(), msg, 'Second store state is set from first store.')

    is.end()
  })

  main.end()
})

