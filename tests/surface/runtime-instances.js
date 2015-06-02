import Storefront from '../../index'
import test from 'tape'

test( 'Storefront Instances:', main => {
  let RT= Storefront.newInstance()

  main.ok(
    RT,
    'Created new instance'
  )

  main.notEqual(
    Storefront,
    RT,
    'New instance is separate but equal'
  )



  main.test( ' -> settings', is => {

    is.deepEqual(
      Storefront.settings,
      RT.settings,
      'Defaults to same settings as original'
    )

    let RT2 = Storefront.newInstance({
      useRAF: false
    })

    is.notDeepEqual(
      Storefront.settings,
      RT2.settings,
      'Merges new settings with original settings'
    )

    is.end()
  })

  // main.test( '', is => {

  // })

  main.end()
})

