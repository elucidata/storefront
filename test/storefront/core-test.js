var test= require( 'tape'), Storefront= require( '../../index')

test('Storefront core API...', function( t){

  t.ok( Storefront, 'exists.')

  t.ok( Storefront.define, 'define() is available.')
  t.ok( Storefront.get, 'get() is available.')
  t.ok( Storefront.configure, 'configure() is available.')
  t.ok( Storefront.onChange, 'onChange() is available.')
  t.ok( Storefront.offChange, 'offChange() is available.')

  t.end()
})
