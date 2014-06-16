/**
 * 文本插入插件
 * 操作步骤：
 *     切换到插入模式；
 *     鼠标会变成编辑样式；
 *     在需要插入的文本位置单击；
 *     进入插入编辑状态
 */
(function ( $W ) {
    var module = $M.define( 'common.plugins.editor.insert' );
    var $B = module.tools;

    // 模块依赖关系
    module.require( 'common.plugins.editor.edit' );
    module.build( 'init', function ( node, conf ) {
        if( !$B.isNode( node ) ) {
            throw module.mName + 'need node as first parameter!';
        }
        var config = $B.parseObj({
            'activeClass'   : '',
            'normalClass'   : '',
            'cbk'           : $B.emptyFn
        }, conf );

        var state = 'normal';
        var pos = { 'l' : 0, 't' : 0 };

        var $tools = {
            // 鼠标样式切换
            'mouseType' : function ( type ) {
                $( node ).css( 'cursor', type || 'text' );
            },

            // 文本插入
            // @param 欲插入文本 文本位置
            'insertTxt' : function ( text, pos ) {

            },

            // 将文本转化为标签，默认为转化成span标签
            'txtToTag' : function ( item, tag ) {
                tag = tag || 'span';
                var text = $( item ).text();

            }
        };

        var $evt = {
            // 启动插入模式
            'start' : function () {
                // 将鼠标样式置为文本编辑状态
                $tools.mouseType( 'text' );
                $tools.txtToTag( node );
                state = 'start';
            },

            // 插入中
            // 处理内容：
            //  根据当前位置，调用edit插件，
            //  启动插入内容编辑状态
            'inserting' : function () {
                $M.modules.common.plugins.editor.edit( pos, {
                    'row' : true,
                    'placeholder' : '编辑插入内容',
                    'okCbk' : $evt.end
                } );
            },

            // 结束插入模式
            // 处理步骤：
            //  拿到编辑输入的编辑文本
            'end' : function ( text ) {
                $tools.mouseType( 'auto' );
                state = 'normal';
            }
        };

        var $evtHandler = {
            // 获取鼠标位置
            'getMousePos' : function ( evt ) {
                if( state == 'start' ) {
                    pos = {
                        'l' : evt.pageX,
                        't' : evt.pageY
                    };
                    $evt.inserting();
                }
            }
        };

        var $evtBind = function () {
            $( node ).on( 'click', $evtHandler.getMousePos );
        };
    } );
})(window);