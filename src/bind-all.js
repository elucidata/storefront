import Type from 'elucidata-type'

export default function bindAll( target, ...props ) {

  props.forEach( key => {
    let prop= target[ key ]

    if( prop && Type.isFunction( prop )) {
      target[ key ]= prop.bind( target )
    }
  })

  return target
}
