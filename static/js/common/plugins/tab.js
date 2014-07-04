/**
 * tab模块
 * @return {obj} 一些外抛方法
 */
(function () {
    var module = $M.define('common.plugins.tab');
    var $B = module.tools;
    var emptyFn = function () {};
    var $plugins = $M.modules.common.plugins;

    module.require( 'common.plugins.strTools' );
    module.build( 'init', function ( node, spec ) {
        $M.create('common.plugins.strTools');
        console.log(module.mName);
        if( !$B.isNode( node ) ) {
            throw module.mName + ' need node as first parameter!';
        }
        var config = $B.parseObj( {
            'keyQuery'      : '[data-tabkey=tabkey]',
            'contentQuery'  : '[data-tabcontent=tabcontent]',
            // 存储数据的属性名
            'dataAttr'      : 'data-tabdata',
            'stepCbk'       : emptyFn,
            // 是否使用tabKey的href=#id的形式
            'useId'         : false,
            // 是否多变，即是否会动态增减tab
            'changeable'    : false,
            'actType'       : 'click',
            'activeKeyClass': 'active'
        }, spec );

        var that = {}, nodes = {};
        var pluginInit = function () {
            if( !config.changeable ) {
                nodes.keyList = $( config.keyQuery, node );
                nodes.contentList = $( config.contentQuery );
            }
        };

        var funcs = {
            'activeKey' : function ( key ) {
                var keys;
                if( !config.changeable ) {
                    keys = nodes.keyList;
                }
                else {
                    keys = $( config.keyQuery, node );
                }
                var keys = $( config.keyQuery, node );
                keys.removeClass( config.activeKeyClass );
                $( key ).addClass( config.activeKeyClass );
            },

            'activeBox' : function ( box ) {
                var boxs;
                if( !config.changeable ) {
                    boxs = nodes.contentList;
                }
                else {
                    boxs = $( config.contentQuery, node );
                }
                boxs.hide();
                $( box ).show();
            }
        };

        var evtHandler = {
            // 通过计算匹配索引的形式
            'act' : function ( evt ) {
                var target = $( evt.currentTarget );
                var data = $plugins.strTools.me.strToJson( target.attr( config.dataAttr ) );
                var keys, boxs;
                if( !config.changeable ) {
                    keys = nodes.keyList;
                    boxs = nodes.contentList;
                }
                else {
                    keys = $( config.keyQuery, node );
                    boxs = $( config.contentQuery, node );
                }
                var pos = -1;
                keys.each( function ( index, item ) {
                    if( target[0] == item ) {
                        pos = index;
                        return false;
                    }
                })
                if( pos < 0 ) {
                    return;
                }
                var newBox = boxs.eq( pos );
                funcs.activeKey( target );
                funcs.activeBox( newBox );
                config.stepCbk( target, data );
            },
            // 通过id的形式
            'actById' : function ( evt ) {
                var target = $( evt.currentTarget );
                var data = $plugins.strTools.me.strToJson( target.attr( config.dataAttr ) );
                var newBox = $( target.attr('href') );
                if( newBox.length ) {
                    funcs.activeKey( target );
                    funcs.activeBox( newBox );
                    config.stepCbk( target, data );
                }
            }
        };

        var evtBind = function () {
            $( node ).delegate( config.keyQuery, config.actType, evtHandler[config.useId ? 'actById' : 'act' ] );
        };

        var init = function () {
            pluginInit();
            evtBind();
        };
        init();

        that.showTab = function ( spec ) {
            var key;
            var keys, boxs;

            if( !config.changeable ) {
                keys = nodes.keyList;
                boxs = nodes.contentList;
            }
            else {
                keys = $( config.keyQuery, node );
                boxs = $( config.contentQuery, node );
            }

            if( typeof spec == 'number' && spec >= 0 && spec < keys.length ) {
                funcs.activeKey( keys[spec] );
                funcs.activeKey( boxs[spec] );
            }
            else if( $B.isNode( spec ) ) {
                evtHandler[config.useId ? 'actById' : 'act' ]( {
                    'currentTarget' : spec
                } );
            }
        };
        return that;
    } );
})();