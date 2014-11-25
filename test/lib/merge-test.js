var test= require( 'tape'),
    merge= require( '../../lib/merge')

test( 'lib/merge.js: Merge...', function( t){
  var target= { a:'A' },
      source= { b:'B' }

  t.deepEqual(
    Object.keys( merge({}, target, source) ),
    ['a', 'b'],
    "keys merged"
  )

  t.deepEqual(
    merge({}, target, source),
    { a:'A', b:'B' },
    "objects merged"
  )

  t.deepEqual(
    merge({}, target, source, { c:'C', d:'D' }),
    { a:'A', b:'B', c:'C', d:'D' },
    "multiple objects merged"
  )

  t.end()
})
