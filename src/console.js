// Based on: https://github.com/paulmillr/console-polyfill/blob/master/index.js
module.exports=
(function( con) {
  var prop, method,
      empty= {},
      dummy= function() {},
      properties= [
        'memory'
      ],
      methods= [
        'assert',
        'clear',
        'count',
        'debug',
        'dir',
        'dirxml',
        'error',
        'exception',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'markTimeline',
        'profile',
        'profiles',
        'profileEnd',
        'show',
        'table',
        'time',
        'timeEnd',
        'timeline',
        'timelineEnd',
        'timeStamp',
        'trace',
        'warn'
      ]

  while( prop= properties.pop()) {  // jshint ignore:line
    con[ prop]= con[ prop] || empty
  }

  while( method= methods.pop()) {  // jshint ignore:line
    con[ method]= con[ method] || dummy
  }

  return con

})( global.console= global.console || {})
