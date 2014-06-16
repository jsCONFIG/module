(function () {
    var module = $M.define( 'mod1' );
    var $B = module.tools;
    
    module.require( 'mod3', 'mods/mod3.js' );
    module.build( 'init', function ( node, color ) {
        if( !$B.isNode( node ) ) {
            module.log( module.mName + ' need node as first parameter!', 'Error' );
            throw module.mName + ' need node as first parameter!';
        }
        node.style.color = color || '#3399cc';
        $M.create( 'mod3', 'called by mod1' );
    } );
})();