var test= require( 'tape'),
    fnName= require( '../../lib/fn-name')

test( 'Function Name...', function( t){

  function testName() {}

  t.equal( fnName( testName), 'testName', 'extracts function name.')

  t.end()
})
