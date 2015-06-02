
export function StoreBuilder( store  ) {

  const state = {
    value: '?',
    setCount: 0
  }

  store.actions({

    setValue( action ) {
      state.value = action.payload
      state.setCount = state.setCount + 1
      store.hasChanged()
    }

  })

  store.outlets({

    getValue() {
      return state.value
    }

  })

  return {
    rawState: state
  }
}
