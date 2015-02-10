!function (){
    if( window.$M && typeof window.$M == 'object' ) {
        return;
    }

    var $M = {},
        // 工具集tools
        $T = {},
        // config
        $C = {};

    $M.info = 'VERSION: 2.0.7 \n AUTHOR: liuping \n A Controller For Modules';
    $C = {
        // 分割符
        'splitSym'   : '/',
        // 模块初始化方法名称
        'initFnName' : 'init',
        // 模块销毁方法名称
        'destroyFnName': 'destroy',
        // 配合某个js加载完成后，再加载另外一个js文件的逻辑
        'scriptSrc' : 'msrc',
        'afterSrc' : 'after',
        // create之后，得到的结果挂载在模块上对应的Key名
        'handlerName' : 'me',
        // 加载js的路径目录
        'sourceRoot' : '',
        // debug模式下，会开启tailLog，
        // 可选择为某种类型的log
        'debug' : false,
        // 是否使用log的总开关，优先级高于debug
        'useLog': true
    };

    /**
     * 常用工具定义
     */
    var _tools = function (){};

    // 获取唯一值,[0-9a-z]{len}
    _tools.prototype.unikey = function ( len ) {
        var l = (typeof len == 'number') ? len : 16;
        var result = '';
        for( ; result.length < l; result += Math.random().toString(36).substr(2) );
        return result.substr( 0, l );
    };

    // 清除字符串首尾空格
    _tools.prototype.trim = function (str) {
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

    _tools.prototype.isArray = function ( arr ) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    // 判断数据类型，支持常见的几种数据类型
    _tools.prototype.isWhat = function ( v, type ) {
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
    _tools.prototype.parseObj = function (rootObj, newObj, isNumParse) {
        var tempObj = {};
        newObj = this.isWhat( newObj, 'object' ) ? newObj : {};
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
    _tools.prototype.isNode = function ( node, TypeVal ) {
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
    _tools.prototype.objLength = function ( obj ) {
        var l = 0;
        for( var i in obj ) {
            if( obj.hasOwnProperty( i ) ) {
                l++;
            }
        }
        return l;
    };

    // 获取当前时间，当前支持'Y,y,m,n,d,j,g,G,h,H,i,s'
    _tools.prototype.getTime = function( formateStr, dateObj ) {
        var dObj = (dateObj && dateObj.constructor == Date) ? dateObj : (new Date());

        formateStr = formateStr || 'Y-m-d H:i:s';

        var dStr    = '',
            year    = dObj.getFullYear(),
            month   = dObj.getMonth() + 1,
            date    = dObj.getDate(),
            hours   = dObj.getHours(),
            minutes = dObj.getMinutes(),
            seconds = dObj.getSeconds(),
            yearStr = year.toString(),
            monthStr= month.toString(),
            dateStr = date.toString(),
            hoursStr= hours.toString(),
            minuStr = minutes.toString(),
            secStr  = seconds.toString();

        for( var i = 0, fL = formateStr.length; i < fL; i++ ) {
            var flag = formateStr.charAt( i );

            switch( flag ) {
                /**
                 * 年
                 */
                // 四位完整年数，如:"2014"
                case 'Y':
                    dStr += yearStr;
                    break;

                // 两位年数，如14
                case 'y':
                    dStr += yearStr.slice( yearStr.length - 2 );;
                    break;

                /**
                 * 月
                 */
                // 有前导0的月数，eg. "01"
                case 'm':
                    dStr += (monthStr.length < 2 ? ('0' + monthStr) : monthStr);
                    break;

                // 无前导0的月数
                case 'n':
                    dStr += monthStr;
                    break;

                /**
                 * 日
                 */
                // 有前导0的日数
                case 'd':
                    dStr += (dateStr.length < 2 ? ('0' + dateStr) : dateStr);
                    break;

                // 无前导0的日数
                case 'j':
                    dStr += dateStr;
                    break;

                /**
                 * 时间
                 */
                // 12小时制，无前导0
                case 'g':
                    dStr += (hours % 12);
                    break;

                // 24小时制，无前导0
                case 'G':
                    dStr += hours;
                    break;

                // 12小时制，有前导0
                case 'h':
                    var hTmp = (hours % 12).toString();
                    dStr += (hTmp.length < 2 ? ('0' + hTmp) : hTmp);
                    break;

                // 24小时制，有前导0
                case 'H':
                    dStr += (hoursStr.length < 2 ? ('0' + hoursStr) : hoursStr);
                    break;

                // 带前导0的分钟
                case 'i':
                    dStr += (minuStr.length < 2 ? ('0' + minuStr) : minuStr);
                    break;

                // 带前导0的秒钟
                case 's':
                    dStr += (secStr.length < 2 ? ('0' + secStr) : secStr);
                    break;

                // 其它情况直接相加
                default:
                    dStr += flag;
            }
        }

        return dStr;
    };

    // 类继承方法，保证先继承，然后在定制化
    _tools.prototype.extend = function ( subClass, supClass ) {
        // 这样做的好处是在超类很复杂的情况下，造成的资源浪费
        var F = function () {};
        F.prototype = supClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        return subClass;
    };

    // 将一个对象转换成一个类
    // ps:采用覆写prototype的方法，保证在继承之后执行
    _tools.prototype.newClass = function ( obj, nclass ) {
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
    _tools.prototype.indexOf = function (item, arr) {
        if (!this.isArray(arr)) {
            return false;
        }
        if (typeof arr.indexOf != 'undefined') {
            $T.indexOf = function (otherItem, otherArr) {
                return otherArr.indexOf(otherItem);
            };
        } else {
            $T.indexOf = function (otherItem, otherArr) {
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
        return $T.indexOf(item, arr);
    };

    _tools.prototype.consoleLog = function ( str ) {
        if( console && console.log ) {
            console.log( str );
        }
    };

    _tools.prototype.emptyFn = function () {};

    _tools.prototype.removeNode = function (theNode) {
        theNode.parentNode.removeChild(theNode);
    };

    // 判断是否存在
    _tools.prototype.isDefined = function ( nameStr, obj ) {
        nameStr = this.trim( nameStr );
        var mod;
        if( nameStr.indexOf($C.splitSym) == -1 ) {
            mod = obj[nameStr]
        }
        else {
            var nameArr = nameStr.split($C.splitSym);
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

    $T = new _tools;
    $T.delay = function( fn ){
        setTimeout( function (){
            fn && fn();
        } );
    };

    /**
     * 内部dom方法简写
     * @type {Object}
     */
    var _dom = {};
    _dom.c = document.createElement;
    _dom.body = document.body;
    _dom.addAttrs = function ( n, attr ) {
        for( var i in attr ) {
            if( attr.hasOwnProperty( i ) ) {
                n.setAttribute( i, attr[i] );
            }
        }
    };

    /**
     * jsLoader对象组件
     * @type {Object}
     */
    var _js = {
        'lock' : false,
        // 待加载资源
        'tobe' : {},
        // 待加载顺序队列
        'tobeorder' : [],
        'conf' : {},
        // 已加载列表
        'done' : [],
        // onload的方法兼容封装
        'onload' : function ( sNode, cbk, srcStr ) {
            if( 'onload' in sNode ) {
                _js.onload = function ( sNodeo, cbko, src ) {
                    sNodeo.onload = function () {
                        var tempThis = this;
                        cbko && cbko( tempThis, sNodeo );
                        _js.conf[ src ] && _js.conf[ src ].isClear && $T.removeNode( sNodeo );
                    };
                };
            }
            else if( 'onreadystatechange' in sNode ) {
                _js.onload = function ( sNodeo, cbko, src ) {
                    sNodeo.onreadystatechange = function () {
                        var tempThis = this;
                        var rs = tempThis.readyState;
                        if( rs == 'loaded' || rs == 'complete' ) {
                            cbko && cbko( tempThis, sNodeo );
                            _js.conf[ src ] && _js.conf[ src ].isClear && $T.removeNode( sNodeo );
                        }
                    };
                };
            }
            else {
                return false;
            }
            return _js.onload( sNode, cbk, srcStr );
        },
        // 创建节点标签
        'create' : function ( srcStr, cbk ) {
            var realSrc = srcStr;
            var sNode = document.createElement( 'script' );
            var attrs = {
                'type' : 'text/javascript',
                'src'  : realSrc
            };
            if( _js.conf[ srcStr ] && _js.conf[ srcStr ].isAsync ) {
                attrs[ 'async' ] = 'true';
                attrs[ 'defer' ] = '';
            }
            _dom.addAttrs( sNode, attrs );
            _js.onload( sNode, cbk, srcStr );

            _dom.body.appendChild( sNode );
        },
        'start' : function () {
            _js.lock = true;
            while( _js.tobeorder.length ){
                var src = _js.tobeorder.shift();
                var cbks = _js.tobe[ src ];
                _js.create( src, function ( _this, sNodeo ) {
                    for( var i = 0, cL = cbks.length; i < cL; i++ ) {
                        cbks[i]( _this );
                    }
                    _js.done.push( src );
                    delete _js.tobe[ src ];
                } );
            }
            if( !_js.tobeorder.length ){
                _js.lock = false;
            }

        },
        // 抛到外层的调用方法
        'load' : function ( srcStr, conf ) {
            srcStr = $T.trim( srcStr );
            var config = $T.parseObj( {
                'cbk' : function (){},
                'isAsync' : false,
                'isClear' : false,
                'sudo' : false
            }, conf );
            var cbk = config.cbk;
            // 当前欲加载内容在待加载队列中
            if( _js.tobe.hasOwnProperty( srcStr ) ) {
                cbk && _js.tobe[ srcStr ].push( cbk );
            }
            // 当前欲加载内容在已加载数组中
            else if( $T.indexOf( srcStr, _js.done ) != -1 && !config.sudo ) {
                cbk && cbk( srcStr );
            }
            // 当前欲加载内容从未出现过或者sudo模式
            else {
                _js.conf[ srcStr ] = {
                    'isAsync' : config.isAsync,
                    'isClear' : config.isClear
                };
                _js.tobe[ srcStr ] = [];
                cbk && _js.tobe[ srcStr ].push( cbk );
                _js.tobeorder.push( srcStr );
            }
            if( !_js.lock ) {
                _js.start();
            }
        }
    };

    /***************
     * 通信管理基类
     * 一个页面仅使用一个通信基类，
     * 为避免往原型链上的查找，减少资源消耗，
     * 直接将方法挂载在基类上
     ***************/
    var _msg = function () {
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
                mName = mReceiver.mName || $T.unikey();
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

            var hL = ( $handler[ receiverIndex ] || [] ).length;
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

    // 实例化一个通信基类
    var mMsg = new _msg;

    // 依赖处理
    var _rely = {
        'cbks' : {},
        // 存放模块实际地址（带前缀）
        'list' : {},
        // 存放已完整加载的模块名
        'done' : [],
        // 存放已define的模块名（非代表该模块已全部加载）
        'defined' : {},
        // 由于异步加载的js，
        // 增加tobestart供define时使用
        'tobestart' : {},
        'start' : function ( module, cbk ) {
            var self = this;
            if( !self.cbks[ module ] ) {
                self.cbks[ module ] = [];
            }
            var strM = module;
            module = $M.getModule( module );
            // 获取依赖列表
            var rLink = module.rLink;
            if( rLink.length == 0 || $T.indexOf( module.mName, self.done ) != -1 ) {
                cbk && cbk( module.mName );
            }
            else {
                self.cbks[ strM ].push( cbk );
                var rL = rLink.length;
                var count = rL;
                // 遍历模块的依赖库
                for( var i = 0; i < rL; i++ ) {
                    var tempMName = rLink[i];
                    // 如果某个依赖模块及其依赖的其它模块已经加载，
                    // 则当前模块依赖数--;
                    if( $T.indexOf( tempMName, self.done ) != -1 ){
                        count--;
                        if( count <= 0 ) {
                            self.done.push( module.mName );
                            var cbks = self.cbks[ strM ];
                            while( cbks && cbks.length ) {
                                var cb = cbks.shift();
                                cb && cb();
                            }
                        }
                    }
                    else {
                        // 否则，加载该文件
                        // 执行依赖处理
                        // 需要注意的是，异步加载下，onload时不代表已执行其内部代码
                        // 因此，需要其已经define
                        (function(){
                            var theMName = tempMName;
                            var theStrM = strM;
                            var theM = module;
                            var tempFn = function (){
                                self.start( theMName, function () {
                                    count--;
                                    if( count <= 0 ) {
                                        self.done.push( theM.mName );
                                        var cbks = self.cbks[ theStrM ];
                                        while( cbks && cbks.length ) {
                                            var cb = cbks.shift();
                                            cb && cb();
                                        }
                                    }
                                });
                            };
                            if( !self.defined[ theMName ] ){
                                _js.load( self.list[ theMName ], {
                                    'cbk' :function () {
                                        if( self.defined[ theMName ] ){
                                            tempFn();
                                        }
                                        else {
                                            if( !self.tobestart[ theMName ] ){
                                                self.tobestart[ theMName ] = [];
                                            }
                                            self.tobestart[ theMName ].push( tempFn );
                                        }
                                    },
                                    'isAsync' : true,
                                    'isClear' : true
                                });
                            }
                            else {
                                tempFn();
                            }
                        })();
                    }
                }
            }
        }
    };

    /**
     * 路径管理
     * @return {[type]} [description]
     */
    var _path = function () {
        var path = {};
        this.get = function ( name ) {
            if( typeof name == 'string' && path.hasOwnProperty( name ) ) {
                return path[name];
            }
        };
        this.set = function () {
            var failList = [];
            if( $T.isWhat( arguments[0], 'object' ) ) {
                var paths = arguments[0],
                    sudo = arguments[1];
                for( var i in paths ) {
                    if( paths.hasOwnProperty( i ) && ( sudo || !path.hasOwnProperty( i ) ) ) {
                        path[ i ] = paths[i];
                    }
                    else {
                        failList.push( i );
                    }
                }
            }
            else if( typeof arguments[0] == 'string' && arguments.length > 1 ) {
                var name = arguments[0],
                    url = arguments[1],
                    sudo = arguments[2];
                if( sudo || !path.hasOwnProperty( name ) ) {
                    path[ name ] = url;
                }
                else {
                    failList.push( name );
                }
            }
            $C.debug && failList.length && $T.consoleLog( 'Setting path error list: ' + failList.join(',') );
        }
    };

    var $mPath = new _path;
    /************
     * 主基类
     ***********/
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
        // 模块名称
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
        // 用于辅助日志展示行为,
        // 类似于linux中的tail -f状态开关
        this.__tailState = $C.debug || false;
        // 模块接口可使用状态
        this.mUsable = true;
    };

    // 方法执行后的句柄
    var $handler = {};

    /**************
     * 主基类扩展
     *************/

    //=====日志 
    M.prototype.tailLog = function ( state ) {
        if( !$C.useLog ) return;
        if( typeof state == 'undefined' ) {
            state = true;
        } 
        if( state && !this.__tailState ) {
            state && this.showLog( this.__tailState );
        }
        this.__tailState = state;
    };

    // 记录日志
    M.prototype.log = function ( str, type ) {
        if( !$C.useLog ) return;
        var timeStr = $T.getTime();
        var logStr = 'LOG[' + (type || 'normal') + ']:' + str + ' At ' + timeStr + '\n';
        if( this.__tailState ) {
            this.__tailState === 'process' && $T.consoleLog( logStr );
            if( type === this.__tailState ) {
                $T.consoleLog( logStr );
            }
        }
        this.logList[ this.logList.length ] = logStr;
    };

    // 展示日志，只展示执行该方法那一刻为止的日志记录
    M.prototype.showLog = function ( type ) {
        if( !$C.useLog ) return '';
        if( typeof type == "string" ) {
            var staticLog = '';
            for( var i = 0, logL = this.logList.length; i < logL; i++ ) {
                var item = this.logList[i];
                var pose = item.indexOf( ']' ),
                    poss = item.indexOf( '[' );

                if( item.slice( poss+1, pose ) == type ) {
                    staticLog += item;
                }
            }
        }
        else {
            var staticLog = this.logList.join( '' );
        }
        $T.consoleLog( staticLog );
        return staticLog;
    };

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
                            this.log( 'Running:' + (this.mName || 'anonymity') + $C.splitSym + i, 'Record' );
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
            this.log( 'Success define for \"' + i + '\" in ' + this.mName, 'Define' );
        }
        return this;
    };

    //=====创建
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
        else if( $T.isWhat( iName, 'array' ) ) {
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
     * 依赖关系设定
     * @param  {[type]} nameStr [description]
     * @param  {[type]} srcUrl  [description]
     * @return {[type]}         [description]
     */
    M.prototype.require = function ( nameStr, srcUrl ) {
        var srcStr = srcUrl;
        nameStr = $T.trim( nameStr );
        if( typeof srcUrl != 'string' || !$T.trim( srcUrl ) ) {
            var custPath = $M.path.get( nameStr );
            var path = $mPath.get( nameStr );
            var pathStr = (typeof custPath == 'string' ? custPath : path);
            srcStr = (typeof pathStr == 'string' ? pathStr : nameStr + '.js');
        }
        srcStr = $C.sourceRoot + $T.trim( srcStr );
        $mPath.set( nameStr, srcStr );
        // 避免重复添加
        !_rely.list.hasOwnProperty( nameStr ) && (_rely.list[ nameStr ] = srcStr);
        $T.indexOf( nameStr, this.rLink ) == -1 && (this.rLink.push( nameStr ));
    };

    // 简写 create-执行 方法
    M.prototype.create = function () {
        var spec;
        if( arguments.length ) {
            spec = Array.prototype.slice.call(arguments,0)
        }
        $M.create( this.mName, spec );
    };

    M.prototype.tools = $M.tools = new _tools;

    // 定义的模块都将挂到该对象上
    $M.modules = {};
    // 自定义路径
    $M.path = new _path();
    /**
     * 定义模块，该定义方法会返回定义好的模块基类实例
     * 实例的之后扩展全在返回得到实例之后进行，所以整个
     * 操作在一个闭包中进行
     * @param  {[type]} mNameStr 实例挂载的命名空间
     * @return {[type]}          实例
     */
    $M.define = function ( mNameStr ) {
        mNameStr = $T.trim( mNameStr );
        var mExample = new M( mNameStr );
        if( mNameStr.indexOf($C.splitSym) == -1 ) {
            if( mNameStr in $M.modules ) {
                throw 'Repeat define for ' + mNameStr;
            }
            $M.modules[ mNameStr ] = mExample;
        }
        else {
            var nameArr = mNameStr.split($C.splitSym);
            var tempFunc = $M.modules;
            for ( var i = 0; i < nameArr.length - 1; i++ ) {
                tempFunc = tempFunc[nameArr[i]] = (nameArr[i] in tempFunc) ? tempFunc[nameArr[i]] : {};
            }
            tempFunc[nameArr.pop()] = mExample;
        }
        _rely.defined[ mNameStr ] = true;
        $T.delay(function (){
            var fns = _rely.tobestart[ mNameStr ];
            while( fns && fns.length ) {
                var fn = fns.shift();
                fn();
            }
        });
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
        nameStr = $T.trim( nameStr );
        if( !nameStr ) {
            return;
        }
        var mod = $M.getModule( nameStr );
        if( !mod ) {
            throw 'The module(' + nameStr + ') you input to "create" is not exist!';
        }
        var cbkFn = function () {
            // 将单个参数转化成数组，方便统一处理
            if( !$T.isArray( spec ) ) {
                spec = [ spec ];
            }
            mod[ $C.handlerName ] = (mod[ $C.initFnName ] && mod[ $C.initFnName ].apply( mod, spec ));
            cbk && cbk( mod );
        };
        _rely.start( nameStr, cbkFn );
    };

    /**
     * 已生成模块的销毁方法
     * @param  {[type]} nameStr 待销毁模块的mName值
     * @return {[type]}         [description]
     */
    $M.destroy = function ( nameStr ) {
        if( nameStr && $M.modules[ nameStr] ) {
            $M.modules[ nameStr][ $C.destroyFnName ] && $M.modules[ nameStr][ $C.destroyFnName ]();
            delete $M.modules[ nameStr];
            _rely.defined[ nameStr ] && (delete _rely.defined[ nameStr ]);
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * 重新加载某个模块(仅能加载通过require引入的模块)
     * @param  {[type]} nameStr [description]
     * @return {[type]}         [description]
     */
    $M.reload = function ( nameStr ) {
        if( nameStr && $M.modules[ nameStr] ) {
            var custPath = $M.path.get( nameStr );
            var path = $mPath.get( nameStr );
            var pathStr = (typeof custPath == 'string' ? custPath : path);
            if( !pathStr ) {
                return false;
            }
            $M.destroy( nameStr );
            _js.load( pathStr, {
                'sudo' : true,
                'isClear' : true
            } );
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * 配置$C
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
        $C = $T.parseObj( $C, specObj );
        return true;
    };

    // publish/subscribe
    $M.pubsub = (function () {
        var pool = new _msg;
        var msender = {
            'mName' : '$pub'
        };
        var pubChannel = '__pub_channel_' + $T.unikey(4) + '_';
        return {
            'publish' : function ( topic, spec ) {
                if( topic.length > 0 && topic.length <= 10 ) {
                    pool.push( spec, pubChannel + topic, msender );
                    return true;
                }
            },
            'subscribe' : function ( topic, fn ) {
                if( topic.length > 0 && topic.length <= 10 ) {
                    pool.addHandler( pubChannel + topic, fn );
                    return true;
                }
            },
            'unsub' : function ( topic, fn ) {
                if( topic.length > 0 && topic.length <= 10 ) {
                    pool.delHandler( pubChannel + topic, fn );
                    return true;
                }
            }
        };
    })();

    $M.newM = function ( name ) {
        return new M( name );
    };

    /**
     * 加载资源简写表
     * @type {}
     */
    // $M.path = new $PATH;

    $M.jsLoader = _js.load;

    // 获取模块
    $M.getModule = function ( moduleName ) {
        var nameStr = $T.trim( moduleName );
        if( !nameStr.length ) {
            return false;
        }
        var mod;
        if( nameStr.indexOf($C.splitSym) == -1 ) {
            mod = $M.modules[nameStr]
        }
        else {
            var nameArr = nameStr.split($C.splitSym);
            var tempFunc = $M.modules;
            for ( var j = 0; j < nameArr.length; j++ ) {
                tempFunc = tempFunc[nameArr[j]];
                if( typeof tempFunc == 'undefined' ) {
                    break;
                }
            }
            mod = tempFunc;
        }
        return mod;
    };

    // 使用模块，返回模块对象的handlerName属性
    $M.use = function ( moduleName ) {
        var mod = $M.getModule( moduleName );
        return mod && mod[ $C.handlerName ];
    };

    // 扩展外抛的tools工具集
    $M.expandT = function () {
        var errorList = [];
        if( $T.isWhat( arguments[0], 'object' ) ) {
            var fns = arguments[0],
                sudo = arguments[1];
            for( var i in fns ) {
                if( !$M.tools.hasOwnProperty( i ) || sudo ) {
                    $M.tools[ i ] = fns[ i ];
                }
                else {
                    errorList.push( i );
                }
            }
        }
        else {
            var name = arguments[0],
                fn = arguments[1],
                sudo = arguments[2];
            if( !$M.tools.hasOwnProperty( name ) || sudo ) {
                $M.tools[ name ] = fn;
            }
            else {
                errorList.push( name );
            }
        }
        $C.debug && errorList.length && $T.consoleLog( 'Expanding tools error list: ' + errorList.join(',') );
    };

    var $pluginInit = function () {
        // 检索所有的script标签，查看标签上是否存在afterSrc属性
        // afterSrc属性为当前script标签加载文件加载完成之后再加载的js文件地址(原始地址)
        // 需保证执行该操作的所有script标签要在引入框架js的script标签之前
        var item,
            srcVal,
            afterVal,
            scripts = document.getElementsByTagName('script');

        for( var i = 0, sL = scripts.length; i < sL; i++ ) {
            item = scripts[i];
            if( (srcVal = item.getAttribute( $C.scriptSrc )) && (afterVal = item.getAttribute( $C.afterSrc )) ) {
                _js.load( srcVal, {
                    'cbk' : function () {
                        _js.load( afterVal, {
                            'isClear' : true
                        } );
                    },
                    'isClear' : true
                } );
            }
        }
    };

    var $init = function () {
        $pluginInit();
    };
    $init();

    if ( typeof window.module === "object" && window.module && typeof window.module.exports === "object" ) {
        window.module.exports = $M;
    } else {
        window.$M = $M;

        if ( typeof define === "function" && define.amd ) {
            define( "bmodulejs", [], function () { return $M; } );
        }
    }
}();