/**
 * 编辑模式，用于创建对应文本的副本编辑态
 * 方便进行编辑
 */
(function ( $W ) {
    var module = $M.define( 'common.plugins.editor.editMode' );
    var $B = module.tools;
    
    module.build( 'init', function ( node, conf ) {
        if( !$B.isNode( node ) ) {
            throw module.mName + 'need node as first parameter!';
        }
        var config = $B.parseObj({
            'activeClass'   : '',
            'normalClass'   : '',
            'cbk'           : $B.emptyFn
        }, conf );

        console.log('bbb');
    } );
})(window);