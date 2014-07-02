/**
 * MODULE管理
 * @param  {[type]} $W [description]
 * @return {[type]}    [description]
 */
( function ( $W ) {
    var $M = {};
    $M.info = 'VERSION: 1.0.0 \n AUTHOR: liuping \n A Controller For Modules';


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
        // 加载js的路径目录
        'sourceRoot' : ''
    };

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
        'addQueue': function (srcUrl, conf) {
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
            $JSOBJ.priorityQueue.cbks[ srcUrl ].push( config.callBack );
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
                                // 执行回调，清除索引简表
                                for( var i = 0, cbksL = cbks.length; i < cbksL; i++ ) {
                                    cbks[i](srcUrl);
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
                                cbks[i](srcUrl);
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

        'loader': function (srcUrl, conf) {
            if ($B.isArray(srcUrl)) {
                for (var i = 0; i < srcUrl.length; i++) {
                    $JSOBJ.loader(srcUrl[i], conf);
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
                config.callBack( srcUrl );
                return;
            }

            // 进行添加到加载队列的一系列操作
            // 添加的信息包括：“src”，“power”，“callBack”
            // 如果已在待加载列表中，则只需添加队列即可
            // （PS：此时，如果已经加载完，则不会走到这步，因此，
            // 这时只有两种状态，未加载且不再待加载队列中和未加载但在
            // 待加载队列中）
            if( $JSOBJ.priorityQueue.cbks[ srcUrl ] ) {
                $JSOBJ.addQueue(srcUrl, config);
            }
            else {
                $JSOBJ.addQueue(srcUrl, config);
                if ( !$JSOBJ.globalLock ) {
                    $JSOBJ.jsTagCreat(config);
                }
            }
        }
    };

    var $B = $W.basetools;

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
        // 行为日志
        this.logList = [];
        // 接口相关
        this.interface = {};
        // 用于辅助日志展示行为
        this.__tailState = false;
        // 模块接口可使用状态
        this.mUsable = true;
    };

    // 依赖关系列表
    var $relyList = {};

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
        }
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
     * 其逻辑如下：
     *     每次create，只定义当前创建模块和其直系依赖模块，
     *     在使用其直系依赖模块时，也通过create方法来调用，
     *     因此每次只需处理当前模块和该模块的直系依赖模块
     * @param  {[type]} nameStr 要运行的名称
     * @param  {[type]} spec    [description]
     * @return {[type]}         [description]
     */
    $M.create = function ( nameStr, spec ) {
        nameStr = $B.trim( nameStr );
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
        // 如果已有定义，则执行（保证其依赖模块已有定义）
        if( mod ) {
            if( !$GLOBAL.executedList[nameStr] ) {
                for( var i = 0, rLinkL = mod.rLink.length; i < rLinkL; i++ ) {
                    // 已定义的，包括初次运行就定义的和通过之后的加载器加载定义的
                    // 则直接忽略并进入下一个检测
                    if( $B.isDefined( mod.rLink[i], $M.modules ) ) {
                        continue;
                    }
                    // 未定义的依赖，根据是否开启自动加载做相应的处理
                    else {
                        // 判断是否开启自动加载js文件
                        if( !$CONFIG.autoLoad ) {
                            // 如果未开启，则记录警告，终止执行，返回false
                            mod.log( 'Rely lost for ' + mod.rLink[i], 'Warning' );
                            return false;
                        }
                        else {
                            $JSOBJ.loader( $relyList[ mod.rLink[i] ].src, {
                                'callBack' : function () {
                                    // 如果加载完成依赖的某个模块，
                                    // 则继续执行该模块的构建，
                                    // 重新开始
                                    // （模块是加载即定义的）
                                    $M.create( nameStr, spec );
                                }
                            } );
                            // 这里直接返回，由于js加载需要个过程，
                            // 当前模块是否创建成功需要等待加载结束后才知晓
                            return;
                        }
                    }
                }
            }
            // 将单个参数转化成数组，方便统一处理
            if( !$B.isArray( spec ) ) {
                spec = [ spec ];
            }
            // 将执行后的句柄赋值给$handler对象
            $handler[ mod.mName ] = (mod[ $CONFIG.initFnName ] && mod[ $CONFIG.initFnName ].apply( mod, spec ));
            // 记录已完整执行列表
            $GLOBAL.executedList[nameStr] = true;
            return $handler[ mod.mName ] || true;
        }
        // 如果可查路径，则加载，之后声明定义
        // 判断输入是否有效，
        // 即是否有定义(可通过其它模块的依赖查到)
        else if( $relyList[ nameStr ] ){
            // 判断是否开启自动加载js文件
            if( !$CONFIG.autoLoad ) {
                // 加入待执行列表
                // mod.log( 'Rely lost for ' + mod.rLink[i], 'Warning' );
                return false;
            }
            else {
                $JSOBJ.loader( $relyList[ nameStr ].src, {
                    'callBack' : function () {
                        $M.create( nameStr );
                    }
                } );
                return;
            }
        }
        // 表示当前输入的nameStr无效
        else {
            throw 'Invalid Input for ' + nameStr;
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

    $W.$M = $M;
})(window);