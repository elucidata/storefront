var test= require( 'tape'),
    _console= require( '../../lib/console')  // jshint ignore:line

test( 'lib/console.js: Now...', function( t){

  t.equal( _console, console, 'Returns console object (safely for old runtimes).')

  t.end()
})
