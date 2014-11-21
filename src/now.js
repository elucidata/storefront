
/* global performance */
var now= (()=>{
  if( typeof performance === 'object' && performance.now ) {
    return performance.now.bind( performance )
  }
  else if( Date.now ) {
    return Date.now.bind(Date)
  }
  else {
    return ()=> {
      return (new Date()).getTime()
    }
  }
})()

module.exports= now
