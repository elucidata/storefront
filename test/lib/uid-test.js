var test= require( 'tape'),
    uid= require( '../../lib/uid')

test( 'lib/uid.js: UID...', function( t){

  t.equal( typeof uid(), 'string', 'creates string id.')

  var ids= {}, i= 0, ID_COUNT= 1000

  for(; i < ID_COUNT; i++) {
    ids[ uid() ]= true
  }

  t.equal( Object.keys( ids).length, ID_COUNT, "doesn't create duplicate ids.")

  t.end()
})
