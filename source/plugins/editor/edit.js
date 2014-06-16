/**
 * 编辑插件
 */
(function ( $W ) {
    var module = $M.define( 'common.plugins.editor.edit' );
    var $B = module.tools;

    module.require( 'common.plugins.editor.editMode', 'source/plugins/editor/editMode.js' );
    module.build( 'init', function ( node, conf ) {
        if( !$B.isNode( node ) ) {
            throw module.mName + 'need node as first parameter!';
        }
        var config = $B.parseObj({
            'activeClass'   : '',
            'normalClass'   : '',
            'cbk'           : $B.emptyFn
        }, conf );
        console.log('aaa');
        $M.create( 'common.plugins.editor.editMode', node );
    } );
})(window);