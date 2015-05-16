var test= require( 'tape'),
    extractMethods= require( '../../lib/extract-methods')

test( 'lib/extract-methods.js: Extract methods from objects or inline classes...', function( t){

  t.equal( typeof extractMethods, 'function', 'exists.')

  var source1= {
    name: 'test',
    getItem: function() {},
    setItem: function() {}
  }
  var source2= (function(){
    var _class= function (){}
    _class.prototype.name= 'test'
    _class.prototype.getItem= function getItem(){}
    _class.prototype.setItem= function setItem(){}
    return _class
  })()
  var expected= ['getItem', 'setItem']
  var results1= extractMethods( source1)
  var results2= extractMethods( source2)

  t.ok( results1, 'returns object')

  t.deepEqual(
    Object.keys( results1),
    expected,
    'returns object with correct keys for object source'
  )

  t.deepEqual(
    Object.keys( results2),
    expected,
    'returns object with correct keys for inline class source'
  )


  for( var key in results2) {
    var prop= results2[ key ]
    t.equal(
      typeof( prop),
      'function',
      ('function type returned for source object, key: '+ key)
    )
  }
  for( var key in results1) {
    var prop= results1[ key ]
    t.equal(
      typeof( prop),
      'function',
      ('function type returned for source class, key: '+ key)
    )
  }

  t.end()
})
