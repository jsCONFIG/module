(function () {
    var module = $M.define( 'mod3' );
    var $B = module.tools;
    
    module.build( 'init', function ( msg ) {
        console.log('Say: ' + msg + ' At ' + $B.getTime('-') );
    } );
})();