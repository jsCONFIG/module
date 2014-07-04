/**
 * MODULE管理
 * @param  {[type]} $W [description]
 * @return {[type]}    [description]
 */
( function ( $W ) {
    var $M = {};
    $M.info = 'VERSION: 2.0.2 \n AUTHOR: liuping \n A Controller For Modules';

    // 全局变量
    var $GLOBAL = {
        // 已创建句柄列表，
        // 辅助忽略已执行后，再次调用的重新依赖关系检测
        // 在create成功时定义，在destroy完成时解除
        'executedList' : {}
    };
    // 工具方法集
    var $TOOLS = {
        
    };

    var $CONFIG = {
        // 模块初始化方法名称
        'initFnName' : 'init',
        // 模块销毁方法名称
        'destroyFnName': 'destroy',
        // 是否自动加载js文件
        'autoLoad' : true,
        'autoSrc' : true,
        // 配合某个js加载完成后，再加载另外一个js文件的逻辑
        'scriptSrc' : 'msrc',
        'afterSrc' : 'after',
        // create之后，得到的结果挂载在模块上对应的Key名
        'handlerName' : 'me',
        // 加载js的路径目录
        'sourceRoot' : ''
    };

    /*****************
     * basetools-1.0.0
     */
    
    /**
     * 提供基础的方法，不涉及业务逻辑
     * @param  {[type]} $W [description]
     * @return {[type]}    [description]
     */
    $BASE = {};

    // 获取唯一值,[0-9a-z]{len}
    $BASE.unikey = function ( len ) {
        var l = (typeof len == 'number') ? len : 16;
        var result = '';
        for( ; result.length < l; result += Math.random().toString(36).substr(2) );
        return result.substr( 0, l );
    };

    // 清除字符串首尾空格
    $BASE.trim = function (str) {
        if ((typeof str).toLowerCase() != 'string') {
            return str;
        }
        var sL = str.length;
        var reg = /\s/;
        for ( var i = 0; i < sL; i++ ) {
            if( !reg.test( str.charAt( i ) ) ) {
                break;
            }
        }
        if( i >= sL ) {
            return '';
        }
        for ( var j = sL - 1; j >= 0; j-- ) {
            if( !reg.test( str.charAt( j ) ) ) {
                // 针对slice特性，修正一个位置
                j++;
                break;
            }
        }
        return str.slice( i, j );
    };

    $BASE.isArray = function ( arr ) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    // 判断数据类型，支持常见的几种数据类型
    $BASE.isWhat = function ( v, type ) {
        var typeV = ( typeof v );
        if ( typeV == 'undefined' ) {
            return /^undefined$/i.test( type );
        }
        else{
            var reg = new RegExp( type, 'gi' );
            try {
                var transStr = v.constructor.toString();
                return reg.test( transStr );
            }
            catch(NULL){
                return ( /^object$/i.test( typeV ) && /^null$/i.test( type ) );
            }
        }
    };

    // 对象合并，isNumParse表示是否转换为数值类型
    $BASE.parseObj = function (rootObj, newObj, isNumParse) {
        var tempObj = {};
        newObj = $BASE.isWhat( newObj, 'object' ) ? newObj : {};
        for ( var i in rootObj ) {
            tempObj[i] = rootObj[i];
            if ( i in newObj ) {
                var temp = newObj[i];
                var parseVal = parseFloat(temp);
                if ( isNumParse && !isNaN( parseVal ) ) {
                    temp = parseVal;
                }
                tempObj[i] = temp;
            }
        }
        return tempObj;
    };

    // 检测是否是节点  @param node (| nodeType值)
    $BASE.isNode = function ( node, TypeVal ) {
        if ( node && ( ( typeof node.nodeType ).toLowerCase() == 'number' ) ) {
            if ( !TypeVal ) {
                return true;
            } 
            else {
                return node.nodeType == parseInt(TypeVal);
            }
        } 
        else {
            return false;
        }
    };

    // 获取对象的长度
    $BASE.objLength = function ( obj ) {
        var l = 0;
        for( var i in obj ) {
            if( obj.hasOwnProperty( i ) ) {
                l++;
            }
        }
        return l;
    };

    // 获取当前时间，linkStr为分隔符，
    // offsetDay为平移时间
    $BASE.getTime = function ( linkStr, offsetDay ) {
        var linkStr = linkStr || '/';
        var d = new Date();
        var offD = parseInt( offsetDay );

        if ( !isNaN( offD ) ) {
            // 获取秒数
            var dayS = 86400000 * offD;
            d = new Date( (+d) + dayS );
        }
        var mon = (d.getMonth() + 1),
            day = d.getDate(),
            minu= d.getMinutes(),
            hour= d.getHours(),
            seco= d.getSeconds(),
            year= d.getFullYear();


        mon = mon.toString().length < 2 ? ('0' + mon) : mon;
        day = day.toString().length < 2 ? ('0' + day) : day;
        hour = hour.toString().length < 2 ? ('0' + hour) : hour;
        minu = minu.toString().length < 2 ? ('0' + minu) : minu;
        seco = seco.toString().length < 2 ? ('0' + seco) : seco;

        var dayArr = [];
        dayArr.push( year );
        dayArr.push( mon );
        dayArr.push( day );
        var hourArr = [];
        hourArr.push( hour );
        hourArr.push( minu );
        hourArr.push( seco );
        return dayArr.join( linkStr ) + ' ' + hourArr.join( ':' );
    };

    // 类继承方法，保证先继承，然后在定制化
    $BASE.extend = function ( subClass, supClass ) {
        // 这样做的好处是在超类很复杂的情况下，造成的资源浪费
        var F = function () {};
        F.prototype = supClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        return subClass;
    };

    // 将一个对象转换成一个类
    // ps:采用覆写prototype的方法，保证在继承之后执行
    $BASE.newClass = function ( obj, nclass ) {
        var nClass = nclass || function () {};
        if ( typeof obj == 'object' ) {
            for( var i in obj ) {
                if ( obj.hasOwnProperty( i ) ) {
                    nClass.prototype[ i ] = obj[i];
                }
            }
        }
        return nClass;
    };

    // array索引
    $BASE.indexOf = function (item, arr) {
        if (!$BASE.isArray(arr)) {
            return false;
        }
        if (typeof arr.indexOf != 'undefined') {
            $BASE.indexOf = function (otherItem, otherArr) {
                return otherArr.indexOf(otherItem);
            };
        } else {
            $BASE.indexOf = function (otherItem, otherArr) {
                var index = -1;
                for (var i = 0; i < otherArr.length; i++) {
                    if (otherArr[i] === otherItem) {
                        index = i;
                        break;
                    }
                }
                return index;
            };
        }
        return $BASE.indexOf(item, arr);
    };

    $BASE.consoleLog = function ( str ) {
        if( console && console.log ) {
            console.log( str );
        }
    };

    $BASE.emptyFn = function () {};

    $BASE.removeNode = function (theNode) {
        theNode.parentNode.removeChild(theNode);
    };

    // 判断是否存在
    $BASE.isDefined = function ( nameStr, obj ) {
        nameStr = $BASE.trim( nameStr );
        var mod;
        if( nameStr.indexOf('.') == -1 ) {
            mod = obj[nameStr]
        }
        else {
            var nameArr = nameStr.split('.');
            var tempFunc = obj;
            for ( var i = 0; i < nameArr.length; i++ ) {
                tempFunc = tempFunc[nameArr[i]];
                if( typeof tempFunc == 'undefined' ) {
                    break;
                }
            }
            mod = tempFunc;
        }
        return !!mod;
    };

    var $B = $BASE;

    /**
     * basetools-1.0.0
     * *****************/

    

    // js加载器
    var $JSOBJ = {
        // 待加载js地址队列
        'priorityQueue': {
            'list' : [],
            // 由于有默认值，因此同时作为状态索引表使用
            'cbks' : {}
        },
        // 已加载历史记录(已加载完成)
        'historyQueue': [],
        // 存储js加载状态，ture为正在加载，false为加载完成
        'busyState': {},
        // 加载全局锁，用于避免一个队列中，已加载(队列中已没有)和将要加载(要加入队列中)的重复
        'globalLock': false,
        // 添加到待加载队列，队列顺序根据其配置的权值
        'addQueue': function (srcUrl, conf, spec) {
            var config = $B.parseObj({
                // 权重
                'power': 0,
                'callBack' : function () {}
            }, conf || {}, true);

            // 状态繁忙
            $JSOBJ.busyState[srcUrl] = true;

            // 加入待加载列表并创建索引表
            $JSOBJ.priorityQueue.list.splice(config.power, 0, srcUrl );
            // 创建回调方法列表
            if( !$JSOBJ.priorityQueue.cbks[ srcUrl ] ) {
                $JSOBJ.priorityQueue.cbks[ srcUrl ] = [];
            }
            $JSOBJ.priorityQueue.cbks[ srcUrl ].push( {
                'fn' : config.callBack,
                'custSpec' : spec
            } );
        },

        'jsTagCreat': function (conf) {
            // 锁定全局
            $JSOBJ.globalLock = true;

            var config = $B.parseObj({
                'isAsyn'    : true,
                // 是否在加载完成后清除script标签
                'isClear'   : true
            }, conf || {});

            // 遍历加载
            while ( $JSOBJ.priorityQueue.list.length > 0 ) {
                var srcUrl = $JSOBJ.priorityQueue.list.pop();
                var cbks = $JSOBJ.priorityQueue.cbks[ srcUrl ];
                var scriptNode = document.createElement('script');
                scriptNode.type = 'text/javascript';
                scriptNode.defer = config.isAsyn;
                scriptNode.src = $CONFIG.sourceRoot + srcUrl;
                if (config.isAsyn) {
                    if ('onreadystatechange' in scriptNode) {
                        scriptNode.onreadystatechange = function () {
                            var rs = scriptNode.readyState;
                            if (rs.toLowerCase() == 'loaded' || rs.toLowerCase() == 'complete') {
                                // 执行回调，清除索引简表
                                for( var i = 0, cbksL = cbks.length; i < cbksL; i++ ) {
                                    cbks[i].fn(srcUrl, cbks[i].custSpec );
                                }
                                delete $JSOBJ.priorityQueue.cbks[ srcUrl ];

                                // 状态空闲
                                $JSOBJ.busyState[srcUrl] = false;
                                config.isClear && $B.removeNode(scriptNode);
                                $JSOBJ.historyQueue.push(srcUrl);
                            }
                        };
                    } else {
                        scriptNode.onload = function () {
                            // 执行回调，清除索引简表
                            for( var i = 0, cbksL = cbks.length; i < cbksL; i++ ) {
                                cbks[i].fn(srcUrl, cbks[i].custSpec );
                            }
                            delete $JSOBJ.priorityQueue.cbks[ srcUrl ];

                            // 状态空闲
                            $JSOBJ.busyState[srcUrl] = false;
                            config.isClear && $B.removeNode(scriptNode);
                            $JSOBJ.historyQueue.push(srcUrl);
                        };
                    }
                }
                document.body.appendChild(scriptNode);
            }
            if ($JSOBJ.priorityQueue.list.length == 0) {
                $JSOBJ.globalLock = false;
            }
        },

        'loader': function (srcUrl, conf, spec ) {
            if ($B.isArray(srcUrl)) {
                for (var i = 0; i < srcUrl.length; i++) {
                    $JSOBJ.loader(srcUrl[i], conf, spec );
                }
                return;
            }

            var srcUrl = $B.trim(srcUrl);
            var config = $B.parseObj({
                'isAsyn'    : true,
                'power'     : 0,
                'isClear'   : true,
                'callBack'  : function () {}
            }, conf || {}, true);

            // 检测状态，如果已加载完，则直接执行回调
            if ($B.indexOf(srcUrl, $JSOBJ.historyQueue) != -1) {
                config.callBack( srcUrl, spec );
                return;
            }

            // 进行添加到加载队列的一系列操作
            // 添加的信息包括：“src”，“power”，“callBack”
            // 如果已在待加载列表中，则只需添加队列即可
            // （PS：此时，如果已经加载完，则不会走到这步，因此，
            // 这时只有两种状态，未加载且不再待加载队列中和未加载但在
            // 待加载队列中）
            $JSOBJ.addQueue(srcUrl, config, spec );
            if ( !$JSOBJ.globalLock ) {
                $JSOBJ.jsTagCreat(config);
            }
        }
    };

    /********************
     * 定义通信管理“基站”
     */
    
    var $MSG = function () {
        // 消息回收池，用于存放没有绑定事件处理的消息
        var $msgpool = {};
        // 接收事件处理器
        var $handler = {};

        // 推入消息池
        // @param 待传送数据 接收者模块 发送者模块
        this.push = function ( data, mReceiver, mSender ) {
            // 接收者参数可以是基于基类创建的模块，也可以是传入的唯一码
            var mName = '';
            if( mReceiver.constructor == M ) {
                mName = mReceiver.mName || $B.unikey();
            }
            else if( typeof mReceiver == 'string' ) {
                mName = mReceiver;
            }
            else {
                throw 'MSG pushing error!';
            }
            // 获得接收者的键名
            var receiverIndex = '__MSG__' + mName;
            var sender = mSender.mName;

            // 打包封装后的数据
            var dataPkg = {
                'data'    : data,
                'sender'  : sender,
                'receiver': mName
            };

            var hL = $handler[ receiverIndex ] ? $handler[ receiverIndex ].length : 0;
            if( hL ) {
                for( var i = 0; i < hL; i++ ) {
                    var hFn = $handler[ receiverIndex ][ i ];
                    hFn && hFn( dataPkg );
                }
            }
            else {
                $msgpool[ receiverIndex ] ? $msgpool[ receiverIndex ].push( dataPkg ) :
                    ( $msgpool[ receiverIndex ] = [ dataPkg ] );
                return receiverIndex;
            }
 
        };

        // 获取无事件绑定器的数据
        // @param 接收者模块|push返回的key
        this.get = function ( mReceiver ) {
            var mName = '';
            if( mReceiver.constructor == M ) {
                mName = mReceiver.mName;
            }
            else if ( typeof mReceiver == 'string' ) {
                mName = mReceiver;
            }
            else{
                throw 'MSG getting error!';
            }
            if( mName ) {
                var receiverIndex = '__MSG__' + mName;
                var data = $msgpool[ receiverIndex ];
                $msgpool[ receiverIndex ] = [];
                return data && data.length ? data : undefined;
            }
        };

        // 添加监听方法
        // @param 接收者实例 处理方法
        this.addHandler = function ( mReceiver, fn ) {
            var mName = '';
            if( mReceiver.constructor == M ) {
                mName = mReceiver.mName;
            }
            else if ( typeof mReceiver == 'string' ) {
                mName = mReceiver;
            }
            else{
                throw 'MSG adding handler error!';
            }
            if( mName ) {
                var receiverIndex = '__MSG__' + mName;
                $handler[ receiverIndex ] ? $handler[ receiverIndex ].push( fn ) :
                    ( $handler[ receiverIndex ] = [ fn ] );
            }
        };

        // 移除监听方法
        // @param 接收者实例[ 指定的待解绑方法]
        this.delHandler = function ( mReceiver, fn ) {
            var mName = '';
            if( mReceiver.constructor == M ) {
                mName = mReceiver.mName;
            }
            else if ( typeof mReceiver == 'string' ) {
                mName = mReceiver;
            }
            else{
                throw 'MSG deleting handler error!';
            }
            if( mName ) {
                var receiverIndex = '__MSG__' + mName,
                    hL = 0;
                if( $handler[ receiverIndex ] && (hL = $handler[ receiverIndex ].length) ) {
                    if( fn ) {
                        for ( var i = 0; i< hL; i++ ) {
                            if( $handler[ receiverIndex ][ i ] == fn ) {
                                // 删除对应位置的处理器
                                $handler[ receiverIndex ].splice( i, 0, 1 );
                            }
                        }
                    }
                    else {
                        $handler[ receiverIndex ] = [];
                    }
                }
            }
        };
    };

    /**
     * 路径管理基类
     * @return {[type]} [description]
     */
    var $PATH = function () {};
    $PATH.prototype._set = function ( name, src, sudo ) {
        if( typeof name != 'string' || typeof src != 'string') {
            return false;
        }
        else if( !this.hasOwnProperty( name ) || sudo ) {
            this[name] = src;
            return true;
        }
        return false;
    };

    /**
     * 自定义事件绑定和触发
     */
    var $CUSTEVT = function () {
        this._fnstore = {};
    };
    $CUSTEVT.prototype.fire = function ( evtType, spec ) {
        evtType = $B.trim( evtType );
        if( !evtType ) {
            return;
        }
        var fns = this._fnstore[ evtType ] || [];
        for( var i = 0, fnsL = fns.length; i < fnsL; i++ ) {
            fns[i]( spec );
        }
    };
    $CUSTEVT.prototype.add = function ( evtType, fn ) {
        evtType = $B.trim( evtType );
        if( !evtType || typeof fn != 'function') {
            return;
        }
        this._fnstore[ evtType ] || (this._fnstore[ evtType ] = []);
        this._fnstore[ evtType ].push( fn );
    };
    var $defineCustevt = new $CUSTEVT();

    /**
     * 依赖加载器
     */
    var $loaderLinkState = {};
    var $loaderLinkCbk = {};
    var $loaderLink = function ( modr ) {
        if( $loaderLinkState[ modr.mName ] == 'lock' ) {
            return;
        }
        $loaderLinkState[ modr.mName ] = 'lock';
        var rLink = modr.rLink;

        var callCbk = function () {
            var cbks = $loaderLinkCbk[ modr.mName ] || [];
            for( var m = 0, cbkL = cbks.length; m < cbkL; m++ ) {
                cbks[m] && cbks[m]();
            }
        };
        if( rLink.length == 0 ) {
            callCbk();
            return;
        }
        var nameStr;
        for( var i = 0, rL = rLink.length; i < rL; i++ ) {
            nameStr = rLink[i];
            // 检测该模块是否已经存在
            if( !$GLOBAL.executedList[ nameStr ] ) {
                // 检测是否存在依赖
                if( $relyList[ nameStr ] && $relyList[ nameStr ].src ) {
                    $JSOBJ.loader( $relyList[ nameStr ].src, {
                        'callBack' : function ( src, nameStr ) {
                            var mod;
                            if( nameStr.indexOf('.') == -1 ) {
                                mod = $M.modules[nameStr]
                            }
                            else {
                                var nameArr = nameStr.split('.');
                                var tempFunc = $M.modules;
                                for ( var j = 0; j < nameArr.length; j++ ) {
                                    tempFunc = tempFunc[nameArr[j]];
                                    if( typeof tempFunc == 'undefined' ) {
                                        break;
                                    }
                                }
                                mod = tempFunc;
                            }
                            // 此时的mod，就是当前依赖模块
                            if( mod ) {
                                $loaderLinkCbk[mod.mName] || ( $loaderLinkCbk[mod.mName] = []);
                                // 每个直系依赖加载完，都执行回调，
                                // 减少未加载依赖数，由于使用回调，
                                // 故只需处理当前模块与其直系依赖，
                                // 然后通过回调来维持整个依赖链
                                $loaderLinkCbk[mod.mName].push( function () {
                                    modr.leftLinkNum--;
                                    if( modr.leftLinkNum == 0 ) {
                                        $loaderLinkState[ modr.mName ] = 'ok';
                                        callCbk();
                                    }
                                } );
                                $loaderLink( mod );
                            }
                            else {
                                throw 'Error in ' + nameStr + '. Please check your code!';
                            }
                        }
                    }, nameStr );
                }
                else {
                    throw 'Error on "require" about ' + modr.mName;
                }
            }
            else {
                continue;
            }
        }
    };

    /**
     * 通信管理“基站”定义结束
     * **********************/
    
    /**********
     * 定义基类
     */

    // 创建
    var M = function ( name ) {
        // 跳过运行记录的方法列表
        var skipRecordList = {};
        // 控制哪些方法开启或者略过运行记录
        this.skipRecord = function ( name, state ) {
            if( !name ) {
                return;
            }
            skipRecordList[ name ] = !!state;
        };
        // 判断是否需要略过
        this.needSkip = function ( name ) {
            var state = false;
            if( skipRecordList.hasOwnProperty( name ) ) {
                state = skipRecordList[ name ];
            }
            return state;
        };

        this.mName = name;
        // relation link/关系链
        // 当前模块需要的组件
        this.rLink = [];
        // 剩余未定义依赖模块数
        this.leftLinkNum = 0;
        // 行为日志
        this.logList = [];
        // 接口相关
        this.interface = {};
        // 用于辅助日志展示行为
        this.__tailState = false;
        // 模块接口可使用状态
        this.mUsable = true;
    };

    // 依赖关系列表，详细列表，与简表path相互独立
    // 更倾向于将简表path中放第三方非规范的的js文件地址
    // $relyList放规范的js模块文件地址（require中已自动处理）
    var $relyList = {};

    // 用于存储模块加载运行状态，
    // 不代表模块可用，仅代表已定义
    // 在define方法中更新
    // {
    //      'moduleA' : true,
    //      'moduleB' : false
    // }
    var $moduleState = {};
    // 方法执行后的句柄
    var $handler = {};

    // 基类的通信池
    var mMsg = new $MSG();

    // 动态展示日志变化
    // 参数state为状态开关，不填默认为开
    // 当state为关键字“process”时，
    // 开启模块方法运行记录，即运行build构造的方法时
    // 会抛出运行记录
    M.prototype.tailLog = function ( state ) {
        if( typeof state == 'undefined' ) {
            state = true;
        } 
        if( state && !this.__tailState ) {
            state && this.showLog();
        }
        this.__tailState = state;
    };

    // 记录日志
    M.prototype.log = function ( str, type ) {
        var timeStr = $B.getTime( '-' );
        var logStr = 'LOG[' + (type || 'normal') + ']:' + str + ' At ' + timeStr + '\n';
        this.__tailState && $B.consoleLog( logStr );
        this.logList[ this.logList.length ] = logStr;
    };

    // 展示日志，只展示执行该方法那一刻为止的日志记录
    M.prototype.showLog = function () {
        var staticLog = this.logList.join( '' );
        $B.consoleLog( staticLog );
        return staticLog;
    };

    // 这块把basetools引入到框架中
    M.prototype.tools = $B;

    // 把jsLoader作为tools的一部分引入
    M.prototype.tools.jsLoader = $JSOBJ.loader;

    /**
     * 构建模块，用于初始构建或者扩展模块功能
     * 也可将另外一个模块的功能作为参数传入，
     * 使当前模块拥有(复制)传入模块的功能，
     * 不会拥有(复制)传入模块的原型上的功能
     * @param key-val[ sudo]  | obj[ sudo]
     * @return {[type]} [description]
     * @example
     * var m = $M.newM('test');
     * m.build( 'fn1', function () {}, sudo );
     * m.build( { 'fn1' : function(){} }, sudo );
     */
    M.prototype.build = function () {
        if( !this.mUsable ) {
            this.log( 'No permission for \"building\"!', 'Error' );
            return;
        }

        var paramObj = {},
            sudo;

        // 筛检参数
        switch( typeof arguments[0] ) {
            case 'object' :
                paramObj = arguments[0];
                sudo = arguments[1];
                // 支持仅复制传入对象的个别键
                if( typeof arguments[2] == 'string' ) {
                    if( arguments[0].hasOwnProperty( arguments[2] ) ) {
                        paramObj[ arguments[2] ] = arguments[0][arguments[2]];
                    }
                    else {
                        paramObj = {};
                    }
                }
                break;
            case 'string' :
                paramObj[ arguments[0] ] = arguments[1];
                sudo = arguments[2];
                break;
            default :
                this.log( 'Illegal param for \"building\"', 'Error' );
                return;
        }
        // 扩展功能
        for( var i in paramObj ) {
            // 由于这块推荐的是通过M实例化的模块间的功能复制，
            // 因此不复制位于原型中的方法和属性
            if( !paramObj.hasOwnProperty( i ) ) {
                continue;
            }
            if( this.hasOwnProperty( i ) ) {
                // 如果强制写入，则忽略重复，记录警告日志
                // 否则重复时忽略写入，记录错误日志
                if( sudo ){
                    this.log( 'Repeat define for \"' + i + '\"', 'Warning' );
                }
                else {
                    this.log( 'Repeat define for \"' + i + '\"', 'Error' );
                    continue;
                }
            }

            // 如果定义的是方法，则增加运行日志
            if( typeof paramObj[ i ] == 'function' ) {
                // 如果当前传入是由M构造而来，则不做日志记录处理
                if( paramObj.constructor != M ) {
                    this[ i ] = function () {
                        // 运行日志
                        if( this.__tailState == 'process' && !this.needSkip( i ) ) {
                            this.log( 'Running:' + (this.mName || 'anonymity') + '.' + i, 'Record' );
                        }
                        return paramObj[ i ].apply( this, arguments );
                    };
                }
                else {
                    this[i] = paramObj[i];
                }
            }
            else {
                this[ i ] = paramObj[ i ];
            }
            this.log( 'Success define for \"' + i + '\"', 'Success' );
        }
        return this;
    };

    /**
     * 权限管理
     * @return {[type]} [description]
     */
    // M.prototype.powerManage = function () {

    // };

    /**
     * 删除模块的某个功能
     * @return {[type]} [description]
     */
    // M.prototype.del = function () {
    //     if( typeof arguments[0] == 'string' ) {

    //     }
    // };

    /**
     * 模块通信，将数据发送到指定模块或者频道
     * @param  {[type]} data     要传送的数据
     * @param  {module|string} receiver 接收的模块实例或者频道名称
     */
    M.prototype.mSend = function ( data, receiver ) {
        try{
            mMsg.push( data, receiver, this )
            this.log( 'Sending data from ' + this.mName || 'anonymity' + ' success!', 'Success' );
        }
        catch( e ) {
            this.log( 'Error sending from ' + this.mName || 'anonymity', 'Error' );
        }
    };

    /**
     * 模块通信，监听模块或频道收到的通信请求
     * @param  {Function} fn    接收器处理方法
     * @param  {module|string}   mName 监听的模块实例或者频道名称(可选)
     */
    M.prototype.mMonitor = function ( fn, mName ) {
        try {
            mMsg.addHandler( mName || this, fn );
            this.log( 'Adding monitor in ' + this.mName || 'anonymity' + ' success!', 'Success' );
        }
        catch( e ) {
            this.log( 'Error monitor in ' + this.mName || 'anonymity', 'Error' );
        }
    };

    /**
     * 模块通信，取消监听
     * @param  {Function} fn    接收器处理方法
     * @param  {module|string}   mName 监听的模块实例或者频道名称(可选)
     */
    M.prototype.mUnmonitor = function ( fn, mName ) {
        try {
            mMsg.delHandler( mName || this, fn );
            this.log( 'Deleting monitor in ' + this.mName || 'anonymity' + ' success!', 'Success' );
        }
        catch( e ) {
            this.log( 'Error unmonitor in ' + this.mName || 'anonymity', 'Error' );
        }
    };

    // 接口定义
    /**
     * 接口定义，仅定义，无实际赋值
     * @param  {string} name    接口类名称
     * @param  {string|array}   methods 该接口类拥有的方法或属性名
     * @param  {bool} sudo      是否强制定义，如果为true则遇到重复Name时直接覆写
     * @return {[type]}         合法的接口名称
     */
    M.prototype.interfaceDefine = function ( name, methods, sudo ) {
        if( arguments.length < 2 ) {
            this.log( 'Param illegal for Interface defining', 'Error' );
            return;
        }

        // 是否已有定义
        if( this.interface.hasOwnProperty( name ) ) {
            if( sudo ) {
                this.log( 'Repeat interface defining for \"' + name + '\"', 'Warning' );
            }
            else {
                this.log( 'Repeat interface defining for \"' + name + '\"', 'Error' );
                return;
            }
        }

        if( typeof methods == 'string' ) {
            methods = [ methods ];
        }

        var result = [];
        for( var i in methods ) {
            if( typeof methods[i] != 'string' ) {
                this.log( 'Illegal interface methods name for defining!', 'Error' );
                continue;
            }
            result.push( methods[i] );
        }
        // 这块，sudo模式下，
        this.interface[ name ] = result;
        this.log( 'Success defining for interface \"' + name + '\"', 'Success' );
        return result;
    };

    // 接口检测，鸭式辨型
    // @param 待检测项 存于此模块接口定义中的接口名
    // @return 不支持的方法列表
    M.prototype.interfaceCheck = function ( iName ) {
        var methods = [];
        // 支持基于自身的接口支持检测
        if( typeof iName == 'string' ) {
            if( !this.interface.hasOwnProperty( iName ) ) {
                this.log( 'The interface name of \"' + iName + '\" is not exist!', 'Failure' );
                return false;
            }
            methods = this.interface[ iName ];
        }
        // 支持手动输入接口列表的检测
        else if( $B.isWhat( iName, 'array' ) ) {
            methods = iName;
        }

        else {
            this.log( 'Illegal params for interface checking!', 'Error' );
            return false;
        }

        var mL = methods.length;
        var notSupported = [];
        // 开始检测
        for( var i = 0; i < mL; i++ ) {
            if( methods[i] in this ) {
                continue;
            }
            notSupported.push( methods[i] );
        }
        return (notSupported.length ? notSupported : false);
    };
    
    /**
     * 用于依赖处理，相关依赖关系将存入rLink依赖
     * 关系表中，此处的relyList格式如下：
     *     {
     *         moduleA: {
     *             // 当前模块A的地址
     *             src : 'moduleASrc',
     *             // 依赖于模块A的模块
     *             link: [
     *                 {
     *                     // 是否可以运行
     *                     state: 'off',
     *                     module: moduleWhichRelyA
     *                 }
     *             ]
     *         }
     *     }
     * @param  {string} nameStr 依赖的模块名称
     * @param  {string} srcUrl  该模块对应的路径(可选)
     * @return {[type]}         [description]
     */
    M.prototype.require = function ( nameStr, srcUrl ) {
        if( typeof srcUrl != 'string' && $CONFIG.autoSrc ) {
            srcUrl = nameStr.replace( /\./g, '\/' ) + '.js';
        }
        // 全局依赖列表$relyList中存储某个模块支撑的其它模块列表
        if( $relyList[ nameStr ] ) {
            $relyList[ nameStr ].link.push( {
                'state' : 'off',
                'module': this
            } );
        }
        else {
            $relyList[ nameStr ] = {
                'src' : srcUrl
            };
            $relyList[ nameStr ].link = [ {
                'state' : 'off',
                'module': this
            } ];
        }
        // 模块本身的rLink属性中存储该模块依赖的组件
        if( $B.indexOf( nameStr, this.rLink ) == -1 ) {
            this.rLink.push( nameStr );
            // 依赖模块数++
            this.leftLinkNum++;
        }
        
    };

    // 简写create方法
    M.prototype.create = function () {
        var spec;
        if( arguments.length ) {
            spec = Array.prototype.slice.call(arguments,0)
        }
        $M.create( this.mName, spec );
    };

    // 定义的模块都将挂到该对象上
    $M.modules = {};

    /**
     * 定义模块，该定义方法会返回定义好的模块基类实例
     * 实例的之后扩展全在返回得到实例之后进行，所以整个
     * 操作在一个闭包中进行
     * @param  {[type]} mNameStr 实例挂载的命名空间
     * @return {[type]}          实例
     */
    $M.define = function ( mNameStr ) {
        mNameStr = $B.trim( mNameStr );
        var mExample = new M( mNameStr );
        if( mNameStr.indexOf('.') == -1 ) {
            if( mNameStr in $M.modules ) {
                throw 'Repeat define for ' + mNameStr;
            }
            $M.modules[ mNameStr ] = mExample;
        }
        else {
            var nameArr = mNameStr.split('.');
            var tempFunc = $M.modules;
            for ( var i = 0; i < nameArr.length - 1; i++ ) {
                tempFunc = tempFunc[nameArr[i]] = (nameArr[i] in tempFunc) ? tempFunc[nameArr[i]] : {};
            }
            tempFunc[nameArr.pop()] = mExample;
        }

        return mExample;
    };

    /**
     * 根据已定义规则，生成某个模块(说白了就是执行初始化方法类似于new一个模块对象)
     * 工作：
     *     拉取依赖文件
     *     依赖拉取结束后，执行初始方法
     * 其逻辑如下：
     *     每次create，使用依赖load方法，拉取依赖，
     *     同时，将初始方法的运行交付给loaderLink的回调,
     *     create仅检测load状态，做相应处理
     * @param  {[type]} nameStr 要运行的名称
     * @param  {[type]} spec    [description]
     * @param  {[type]} cbk     [description]
     * @return {[type]}         [description]
     */
    $M.create = function ( nameStr, spec, cbk ) {
        // 做nameStr合法性及相关处理 
        nameStr = $B.trim( nameStr );
        if( !nameStr ) {
            return;
        }
        var mod;
        if( nameStr.indexOf('.') == -1 ) {
            mod = $M.modules[nameStr]
        }
        else {
            var nameArr = nameStr.split('.');
            var tempFunc = $M.modules;
            for ( var i = 0; i < nameArr.length; i++ ) {
                tempFunc = tempFunc[nameArr[i]];
                if( typeof tempFunc == 'undefined' ) {
                    break;
                }
            }
            mod = tempFunc;
        }
        if( !mod ) {
            throw 'The module(' + nameStr + ') you input to "create" is not exist!';
        }

        var state;
        // 如果不存在依赖，则将state置为可执行状态
        if( !mod.rLink.length ) {
            state = 'ok';
        }
        // 否则，拉取依赖
        else {
            state = $loaderLinkState[ nameStr ];
            if( typeof state == 'undefined' ) {
                state = $loaderLinkState[ nameStr ] = 'first';
            }
        }
        switch( state ) {
            // 如果正在拉取依赖中，
            // 则仅存入回调
            case 'lock':
                $loaderLinkCbk[nameStr] || ($loaderLinkCbk[nameStr] = []);
                $loaderLinkCbk[nameStr].push( function () {
                    $M.create( nameStr, spec, cbk );
                });
                break;


            // 如果依赖已经拉取完毕，则直接执行
            case 'ok' :
                // 将单个参数转化成数组，方便统一处理
                if( !$B.isArray( spec ) ) {
                    spec = [ spec ];
                }
                // 将执行后的句柄赋值给$handler对象
                $handler[ mod.mName ]= mod[$CONFIG.handlerName] = (mod[ $CONFIG.initFnName ] && mod[ $CONFIG.initFnName ].apply( mod, spec ));
                // 记录已完整执行列表
                $GLOBAL.executedList[nameStr] = true;
                cbk && cbk( $handler[ mod.mName ] );
                return $handler[ mod.mName ] || true;
                break;

            // 如果是首次拉取依赖，则存储回调，同时执行
            case 'first':
                $loaderLinkCbk[nameStr] || ($loaderLinkCbk[nameStr] = []);
                $loaderLinkCbk[nameStr].push( function () {
                    $M.create( nameStr, spec, cbk );
                });
                $loaderLink( mod );
                break;

            // 其它非预料异常
            default:
                throw 'unknow error on ' + nameStr;
        }
    };

    /**
     * 已生成模块的销毁方法
     * @param  {[type]} nameStr 待销毁模块的mName值
     * @return {[type]}         [description]
     */
    $M.destroy = function ( nameStr ) {
        if( nameStr && $handler[ nameStr] && $handler[ nameStr][ $CONFIG.destroyFnName ] ) {
            $handler[ nameStr][ $CONFIG.destroyFnName ]();
            delete $handler[ nameStr];
            delete $GLOBAL.executedList[nameStr];
        }
    };

    /**
     * 配置$CONFIG
     * @param {obj | key-val}
     * @return {bool} [description]
     */
    $M.options = function () {
        var specObj = {};
        switch( arguments.length ) {
            case 2 :
                specObj[ arguments[0] ] = arguments[1];
                break;
            case 1 :
                specObj = arguments[0];
                break;
            default:
                return false;
        }
        $CONFIG = $B.parseObj( $CONFIG, specObj );
        return true;
    };

    /**
     * 基类定义结束
     * ************/

    $M.newM = function ( name ) {
        return new M( name );
    };

    /**
     * 加载资源简写表
     * @type {}
     */
    $M.path = new $PATH;

    $M.jsLoader = $JSOBJ.loader;

    var $pluginInit = function () {
        // 检索所有的script标签，查看标签上是否存在afterSrc属性
        // afterSrc属性为当前script标签加载文件加载完成之后再加载的js文件地址
        var item,
            srcVal,
            afterVal,
            scripts = document.getElementsByTagName('script');

        for( var i = 0, sL = scripts.length; i < sL; i++ ) {
            item = scripts[i];
            if( (srcVal = item.getAttribute( $CONFIG.scriptSrc )) && (afterVal = item.getAttribute( $CONFIG.afterSrc )) ) {
                $JSOBJ.loader( srcVal, {
                    'callBack' : function () {
                        $JSOBJ.loader( afterVal );
                    }
                } );
            }
        }
    };

    var $init = function () {
        $pluginInit();
    };
    $init();

    $W.$M = $M;
})(window);