(function () {
    var module = $M.define( 'mod2' );
    var $B = module.tools;
    
    module.require( 'mod3', 'mods/mod3.js' );
    module.build( 'init', function ( node, fontSize ) {
        if( !$B.isNode( node ) ) {
            module.log( module.mName + ' need node as first parameter!', 'Error' );
            throw module.mName + ' need node as first parameter!';
        }
        node.style.fontSize = fontSize || '12px';
        $M.create( 'mod3', 'called by mod2' );
    } );
})();