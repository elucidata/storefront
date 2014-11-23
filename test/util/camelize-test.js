var test= require( 'tape'),
    camelize= require( '../../lib/camelize')

test( 'Camelize strings...', function( t){

  t.equal( camelize( 'hello-dog'), 'HelloDog', 'from hyphenated.')
  t.equal( camelize( 'hello-my-main-dog'), 'HelloMyMainDog', 'from deeply hyphenated.')

  t.equal( camelize( 'hello_dog'), 'HelloDog', 'from underscored.')
  t.equal( camelize( 'hello_my_main_dog'), 'HelloMyMainDog', 'from deeply underscored.')

  t.equal( camelize( 'hello-my_main-dog'), 'HelloMyMainDog', 'from mixed types.')

  t.end()
})
