var test= require( 'tape'),
    now= require( '../../lib/now')

test( 'Now...', function( t){

  t.equal( typeof now(), 'number', 'generates numerical representaion of now.')

  t.end()
})
