import Storefront from '../../index'
import test from 'tape'
import {StoreBuilder} from '../test-helpers'

const syncRT= Storefront.newInstance({ asyncDispatch: false, useRAF: false }),
      asyncRT= Storefront.newInstance({ asyncDispatch: true, useRAF: true })


const syncStore = syncRT.define('SyncStore', StoreBuilder)

const asyncStore = syncRT.define('AsyncStore', StoreBuilder)

test( 'Storefront onChange events:', main => {



  main.test( ' -> batched events', is => {
    let eventCount= 0

    is.end()
  })

  main.test( ' -> synced events', is => {
    let eventCount= 0


    is.end()
  })

  main.end()
})

