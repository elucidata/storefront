var test= require( 'tape'),
    now= require( '../../lib/now')

test( 'lib/now.js: Now...', function( t){

  t.equal( typeof now(), 'number', 'generates numerical representaion of now.')

  t.end()
})
