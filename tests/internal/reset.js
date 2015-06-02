import Storefront from '../../index'
import test from 'tape'
import {StoreBuilder} from '../test-helpers'

const RT= Storefront.newInstance({ asyncDispatch: false, useRAF: false }),
      store = RT.define('TestStore', StoreBuilder)

test( 'Storefront reset internals:', is => {

  is.equal( store.getValue(), '?', 'initial state set')

  store.setValue('New')
  is.equal( store.getValue(), 'New', 'new state is set')

  RT.recreateStore( 'TestStore' )
  is.equal( store.getValue(), '?', 'initial state is reset')

  is.end()
})

