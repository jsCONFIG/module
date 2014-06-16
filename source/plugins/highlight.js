(function () {
    var module = $M.define( 'common.plugins.highlight' );
    var $B = module.tools;
    module.require( 'common.plugins.editor.edit', 'source/plugins/editor/edit.js' );
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
        $M.create( 'common.plugins.editor.edit', node );
        console.log(arguments);
    } );
})();