(function () {
    var module = $M.define( 'modInit' );
    var $B = module.tools;

    module.require( 'mod1', 'mods/mod1.js' );
    module.require( 'mod2', 'mods/mod2.js' );
    module.build( 'init', function ( node, conf ) {
        if( !$B.isNode( node ) ) {
            module.log( module.mName + ' need node as first parameter!', 'Error' );
            throw module.mName + ' need node as first parameter!';
        }
        var config = $B.parseObj({
            'activeClass'   : '',
            'normalClass'   : '',
            'cbk'           : $B.emptyFn
        }, conf );
        
        $M.create( 'mod1', [node,'red'] );
        $M.create( 'mod2', [node,'16px'] );
    } );
    $M.create( 'modInit', document.body );
})();