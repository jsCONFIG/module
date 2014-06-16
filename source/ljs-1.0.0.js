/**
 * LJS
 * @version 1.0.0 2013/12/20 11:10
 * @author Bottle_Liu
 * @email clpliuping@126.com
 * LJS是一款基础的平台，
 * 方便对代码模块进行管理
 */
if ( LJS ) {
    
}
else {
var LJS = (function () {
    // 版本号
    var version = '1.0 | liuping';
    // 核心库内部使用，同时外抛的基础通用方法集
    var FUNCS = {};
    // 通用变量
    var global = {};
    // 私有方法
    var PRIVATE = {};
    // 注册方法库
    var LOGICFUNS = {};
    LOGICFUNS.about = 'Library for define\'s functions, all of the functions you defined will be add to this zone.';


    /*================================
     * 通用方法集，含有框架必须的几个功能，功能较通用，故抛出给所有方法共享
     *=================================
     */
    FUNCS.about = 'Library for common functions, you can use it in anywhere.';
    
    // 对象合并，isNumParse表示是否转换为数值类型
    FUNCS.parseObj = function (rootObj, newObj, isNumParse) {
        var tempObj = {};
        var newObj = newObj || {};
        for (var i in rootObj) {
            tempObj[i] = rootObj[i];
            if (i in newObj) {
                var temp = newObj[i];
                var parseVal = parseFloat(temp);
                if (isNumParse && !isNaN(parseVal)) {
                    temp = parseVal;
                }
                tempObj[i] = temp;
            }
        }
        return tempObj;
    };

    // array索引
    FUNCS.indexOf = function (item, arr) {
        if (!FUNCS.isArray(arr)) {
            return false;
        }
        if (typeof arr.indexOf != 'undefined') {
            FUNCS.indexOf = function (otherItem, otherArr) {
                return otherArr.indexOf(otherItem);
            };
        } else {
            FUNCS.indexOf = function (otherItem, otherArr) {
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
        return FUNCS.indexOf(item, arr);
    };

    // 判断数组
    FUNCS.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    // 判断数据类型，完整支持所有数据类型,检测Array是否为object时，会返回false
    FUNCS.isWhat = function ( v, type ) {
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

    // 清除字符串首尾空格
    FUNCS.trim = function (str) {
        if ((typeof str).toLowerCase() != 'string') {
            return;
        }
        var reg = /^\s*(.*?)\s*$/;
        return str.replace(reg, '$1');
    };

    // 数据管理中心
    FUNCS.dataCenter = function () {
        var data = {
            /*
             * 数据库
             */
            'dataBase': {},
            /*
             * 读写权限值
             */
            'purviewKey': true,

            /*
             * 设置读写权限，默认可读写,可设置为只读
             * @patamete 键值
             */
            'purview': function (key) {
                data.purviewKey = !! key;
            },

            /*
             *  添加表，表不存在时将自动创建
             *  @pramete 表名 | 值 | 数据是否去重
             */
            'set': function (str, val, singleKey) {
                // 查询权限
                if (!data.purviewKey) {
                    return;
                }
                if (!FUNCS.isArray(data.dataBase[str])) {
                    if ( !! data.dataBase[str]) {
                        data.dataBase[str] = [data.dataBase[str]];
                    } else {
                        data.dataBase[str] = [];
                    }
                }
                var valIndex = FUNCS.indexOf(val, data.get(str));
                if (singleKey && valIndex > -1) {
                    data.dataBase[str].splice(valIndex, 1);
                }
                data.dataBase[str].push(val);
                return val;
            },
            /*
             *  取得表的数据
             *  @pramete 表名 | 是否是copy件
             */
            'get': function (str, isCopy) {
                var isCopy = ((typeof isCopy).toLowerCase() == 'boolean') ? isCopy : true;
                var result = data.dataBase[str];
                var temp = [];
                if (isCopy && result) {
                    Array.prototype.push.apply(temp, result);
                    result = temp;
                }
                return result;
            },
            /*
             * 取得中心的所有数据
             */
            'show': function () {
                return data.dataBase;
            },
            /*
             *  删除表的数据
             *  @pramete 表名 | [表中项的数字索引]
             */
            'remove': function (str, index) { // index不存在的情况下默认删除表
                // 查询权限
                if (!data.purviewKey) {
                    return;
                }
                var _removeData, index = parseInt(index);
                if (index >= 0) {
                    _removeData = data.dataBase[str][index];
                    data.dataBase[str].splice(index, 1);
                } else if (!index) {
                    _removeData = data.dataBase[str];
                    delete data.dataBase[str];
                }
                return _removeData;
            },
            /*
             *  克隆表的数据，内部复制
             *  @pramete 表名 | 目的表名
             */
            'clone': function (str, toStr) { // 克隆表
                // 查询权限
                if (!data.purviewKey || !data.dataBase[str]) {
                    return;
                }
                var _tempData = data.dataBase[str];
                for (var i = 0; i < _tempData.length; i++) {
                    data.set(toStr, _tempData[i]);
                }
                return _tempData;
            },
            /*
             *  检索是否存在某键
             *  @pramete 待检索键名
             */
            'isHas': function (keyname) {
                return (keyname in data.database);
            },
            /*
             *  检索某数据中是否存在某键，所存储值必须为对象
             *  @pramete 被检索键名，待检索键名
             */
            'isDataHas': function (keyname, name) {
                var valAttr = data.get(keyname);
                if (!FUNCS.isArray(valAttr)) {
                    return -1;
                }
                var val;
                var key = -1;
                for (var i = 0; i < valAttr.length; i++) {
                    val = valAttr[i];
                    if ((typeof val).toLowerCase() != 'object' || FUNCS.isArray(val)) {
                        continue;
                    }
                    if (name in val) {
                        key = i;
                        break;
                    }
                }
                return key;
            },
            /*
             *  检索某数据中是否存在某值，所存储的值必须是对象
             *  @pramete 数据表名，待检索值，可选参数检索值所处键名
             */
            'isDataOwn': function (keyname, indexVal, childKeyName) {
                var valAttr = data.get(keyname);
                if (!FUNCS.isArray(valAttr)) {
                    return -1;
                }
                var val;
                var key = -1;
                for (var i = 0; i < valAttr.length; i++) {
                    val = valAttr[i];
                    if ((typeof val).toLowerCase() != 'object' || FUNCS.isArray(val)) {
                        continue;
                    }
                    if ( !! childKeyName) {
                        if (val[childKeyName] === indexVal) {
                            return i;
                        }
                    } else {
                        for (var j in val) {
                            if (val[j] === indexVal) {
                                return i;
                            }
                        }
                    }
                }
                return -1;
            },
            /*
             *  导入并更新数据
             *  @pramete dataBase
             */
            'upload': function (databaseObj) {
                var database = databaseObj.show();
                if (!data.purviewKey || (typeof database).toLowerCase() != 'object') {
                    return;
                }
                for (var i in database) {
                    data.dataBase[i] = database[i];
                }
                return database;
            },
            /*
             *  导入表数据
             *  @pramete 表名 | 数组形式的值
             */
            'insert': function (str, dataArr, singleKey) {
                if (!data.purviewKey || !FUNCS.isArray(dataArr)) {
                    return;
                }
                if (singleKey) {
                    for (var i = 0; i < dataArr.length; i++) {
                        data.set(str, dataArr[i], true);
                    }
                } else {
                    if (!FUNCS.isArray(data.dataBase[str])) {
                        data.dataBase[str] = (data.dataBase[str] ? [data.dataBase[str]] : []);
                    }
                    data.dataBase[str] = data.dataBase[str].concat(dataArr);
                    return dataArr;
                }
            },
            /*
             *  清空数据库，并不删除
             */
            'destroy': function () { // 销毁数据库
                // 查询权限
                if (!data.purviewKey) {
                    return;
                }
                var _dataBase = [];
                for (var i in data.dataBase) {
                    _dataBase[i] = data.dataBase[i];
                }
                data.dataBase = {};
                return _dataBase;
            }
        }
        // 重新封装
        var _data = {
            'purview': data.purview,
            'set': data.set,
            'get': data.get,
            'show': data.show,
            'remove': data.remove,
            'clone': data.clone,
            'upload': data.upload,
            'insert': data.insert,
            'isHas': data.isHas,
            'isDataHas': data.isDataHas,
            'isDataOwn': data.isDataOwn,
            'destroy': data.destroy
        }
        return _data;
    };

    //获取时间
    FUNCS.getTime = function (linkStr, offsetDay) {
        var linkStr = linkStr || '/';
        var d = new Date();
        var offD = parseInt( offsetDay );

        if ( !isNaN( offD ) ) {
            // 获取秒数
            var dayS = 86400000 * offD;
            d = new Date( (+d) + dayS );
        }
        var mon = (d.getMonth() + 1);
        var day = d.getDate();

        mon = mon.toString().length < 2 ? ('0' + mon) : mon;
        day = day.toString().length < 2 ? ('0' + day) : day;
        return d.getFullYear() + linkStr + mon + linkStr + day;
    };

    // 删除节点
    FUNCS.removeNode = function (theNode) {
        theNode.parentNode.removeChild(theNode);
    };

    // 错误管理
    FUNCS.error = FUNCS.dataCenter();

    // 日志管理
    FUNCS.record = FUNCS.dataCenter();

    // 复制一个对象，如果是数组则复制后依然为数组
    FUNCS.copyObj = function (obj) {
        if (FUNCS.isArray(obj)) {
            return obj.slice(0);
        }
        var temp = {};
        for (var i in obj) {
            var tempObj = obj[i];
            if ((typeof obj[i]).toLowerCase() == 'object') {
                tempObj = FUNCS.copyObj(obj[i]);
            }
            temp[i] = tempObj;
        }
        return temp;
    };

    /*======================
     * 私有方法及私有组件区
     *======================
     */

    // 挂载方法到LJS
    PRIVATE.add = function (name, func) {
        if (name.indexOf('.') == -1 && (!(name in LOGICFUNS))) {
            LOGICFUNS[name] = func;
        } else if (name.indexOf('.') != -1) {
            var nameArr = name.split('.');
            var tempFunc = LOGICFUNS;
            for (var i = 0; i < nameArr.length - 1; i++) {
                tempFunc = tempFunc[nameArr[i]] = (nameArr[i] in tempFunc) ? tempFunc[nameArr[i]] : {};
            }
            tempFunc[nameArr.pop()] = func;
        }
    };
    // 辅助记录define及Rely行为，生成依赖关系数组，确保代码执行顺序
    PRIVATE.importTemp = {
        'base': FUNCS.dataCenter(),
        'reg': function (name, key) { // 刻录加载日志
            var key = key || '__r__'; // i表示Rely的顺序，r表示define的顺序
            PRIVATE.importTemp.base.set('regTemp', key + name); // 辅助检测import的死循环
        },
        // 对数据进行处理，便于执行相关操作，
        // 生成的格式为：{A : [B, C], B : [D]}表示A依赖B、C，B依赖D
        'formatBase': function () {
            var regExp = /^\_\_([ir])\_\_(.+)/;
            var startData = PRIVATE.importTemp.base.get('regTemp');
            var result = {};
            var tempData = {};
            var roundState = false;
            var tempName = [];
            for (var i = 0; i < startData.length; i++) {
                // 从字符串中取核心数据
                tempData = startData[i].match(regExp);
                if (tempData.length >= 3) { // 确保匹配到了数据
                    if (tempData[1] == 'i') {
                        roundState = true;
                        tempName.push(tempData[2]);
                    } else if (tempData[1] == 'r') {
                        if (!roundState) {
                            continue;
                        }
                        result[tempData[2]] = tempName;
                        tempName = [];
                        roundState = false;
                    }
                }
            }
            return result;
        },
        // 依赖关系死循环检测
        'loopCheck': function (relationObj) {
            var tempObj = relationObj || PRIVATE.importTemp.formatBase();
            rObj = FUNCS.copyObj(tempObj); // 杜绝传址
            for (var i in rObj) { // A
                // 依次对项的依赖项进行细化
                for (var j = 0; j < rObj[i].length; j++) {
                    // 如果某项的依赖项也存在依赖项，则把该项全替换为子项
                    if (rObj[i][j] in rObj) { // B in {A : [B, C], B : [D]}
                        // 重新定义循环初始条件
                        var temp = FUNCS.copyObj(rObj[rObj[i][j]]);
                        rObj[i].splice(j, 1);
                        rObj[i] = rObj[i].concat(temp); // {A : [D, C], B : [D]}
                    }
                }
                // 检测某项的依赖项是否包含自身
                if (FUNCS.indexOf(i, rObj[i]) > -1) {
                    FUNCS.error.set('[import]', 'Something may be wrong in import, so that the occurrence of dead loop!');
                    return false;
                }
            }
            return true;
        }
    };



    /*===============
     * 组件区
     *===============
     */

    /*
     * 代码托管器，按照示例中的写法，js文件加载完成后，
     * 通过define注册的方法将被返回到托管器中，执行初始化方法"run"时，
     * 这些保存的方法将被执行，从而完成初始化，这时候，就可以使用plugin中提供的一系列功能了。
     * 采用这种方法的好处是便于管理，当某个plugin依赖其它plugin时，异步加载js可能导致某个plugin还未
     * 完全加载，就被调用，这时将会导致运行出错，而使用代码托管之后，只需将依赖的plugin通过Rely方法
     * 导入，即可保证依赖的plugin在使用前已有定义。
     */
    var ctrlCenter = {
        'scriptCenter': FUNCS.dataCenter(),
        // 当前待执行的模块(执行run方法时，模块所依赖的其它模块未注册，则停止run，同时存储到该库中)
        'toBeRun' : FUNCS.dataCenter(),
        'define': function (name, func) {
            // 此处用于防止覆盖掉自带的方法:形如“__funcList__”的内置方法
            if (/^\_\_.*\_\_$/.test(name)) {
                FUNCS.error.set('[define]', 'illegal name!');
                return;
            }
            // 此处检索在注册的方法列表中是否已经存在name=某个注册名的对象，如存在则表示重复定义
            if (ctrlCenter.scriptCenter.isDataOwn('__funcList__', name, 'name') != -1) {
                FUNCS.error.set('[define]', 'repeat define for ' + name);
                throw '[define]', 'repeat define for ' + name;
                return;
            }
            // 刻录加载日志，用于依赖关系检测
            PRIVATE.importTemp.reg(name);
            // 存储数据
            ctrlCenter.scriptCenter.set('__funcList__', {
                'name': name,
                'func': function (spec) {
                    return func(spec);
                }
            });
            FUNCS.record.set( 'record', '[DEFINE] <' + name + '> has defined!' );
            // 每次定义，都检测当前定义的文件，是否满足待执行队列中的条件，如果满足，则执行初始化
            ctrlCenter.checkToBeRun( name );
        },
        'run': function (name, conf) {
            var config = FUNCS.parseObj({
                'jsTimeOut': 10 * 1000,
                'timeOutFn': function () {}
            }, conf || {}, true);

            // 文件加载检测，<!--仅在当前有文件正在加载时执行-->=============
            // 检测是否有文件正在加载，有则轮询至加载完成,超时则做超时错误处理
            if (JSOBJ.busyState) {
                for (var i in JSOBJ.busyState) {
                    if (JSOBJ.busyState[i]) {
                        // 做轮询的超时处理
                        if (!global.busyClock) {
                            global.busyClock = setTimeout(function () {
                                clearTimeout(global.pollClock);
                                FUNCS.error.set('[jsLoader]', 'TimeOut for loading url:' + i);
                                FUNCS.record.set('record', '[JSLOADER]TimeOut for loading url:' + i);
                                config.timeOutFn(i);
                                global.busyClock = undefined;
                                return;
                            }, config.jsTimeOut);
                        }
                        // 轮询文件是否加载完成
                        global.pollClock = setTimeout(function () {
                            ctrlCenter.run(name);
                        }, 200);
                        return;
                    }
                }
                // 已经加载完成了，则不需要再进行上面的检测，直至有新文件加载
                JSOBJ.busyState = {};
            }
            // 文件已加载，清除超时处理
            clearTimeout(global.busyClock);
            // 获取注册的方法列表
            var funcsObj = ctrlCenter.scriptCenter.get('__funcList__');
            // 未提供name时全部运行
            if (!name) {
                var runListState = [];
                for (var i = funcsObj.length - 1; i >= 0; i--) {
                    runListState.push( ctrlCenter.run(funcsObj[i].name) ? 0 : 1 );
                }
                return !parseInt( runListState.join('') );
            }
            // 如果已经运行，则return
            if (ctrlCenter.isRun(name)) {
                ctrlCenter.checkToBeRun( name );
                return true;
            }

            // 依赖关系处理=================================
            var funcsL = funcsObj.length;
            var orderRecoder = PRIVATE.importTemp.formatBase(); // 获取依赖关系列表
            // 如果死锁，则抛出错误
            if (!PRIVATE.importTemp.loopCheck(orderRecoder)) {
                console && console.log && console.log('dead loop!');
            }
            while (funcsL > 0 && funcsObj[funcsL - 1]) {
                var tempName = funcsObj[funcsL - 1].name;
                // 检测当前运行的代码是否存在依赖关系，如存在，其依赖文件是否已经运行
                if (FUNCS.isArray(orderRecoder[name]) && orderRecoder[name].length > 0) {
                    for (var i = 0; i < orderRecoder[name].length; i++) {
                        if (!ctrlCenter.isRun(orderRecoder[name][i])) { // 判断依赖方法是否已经运行
                            // 如果依赖的js已经加载，则运行之，否则，抛出错误
                            if (ctrlCenter.scriptCenter.isDataOwn('__funcList__', orderRecoder[name][i], 'name') > -1) {
                                var runResult = ctrlCenter.run(orderRecoder[name][i]);
                                // 如果模块的依赖组件未成功运行，则不继续执行模块
                                if ( !runResult ) {
                                    // 此处，通过借助“待运行”列表来辅助依赖关系处理，
                                    // 当框架检测到本模块依赖的模块未运行时，则会将缺乏的模块存入列表
                                    // 当检测到缺乏的模块定义时，则会运行之
                                    if ( ctrlCenter.toBeRun.isDataOwn( 'toBeRun', name, 'name' ) == -1 ){
                                        ctrlCenter.toBeRun.set( 'toBeRun', {
                                            'name' : name,
                                            'poor' : orderRecoder[name][i]
                                        } );
                                    }
                                    return false;
                                }
                            } else {
                                // 如果是开发模式，框架将自动拉取Js文件，
                                // 这时，只需要定义LJS_SOURCE_ROOT
                                if ( window.LJS_DEBUG ) {
                                    var lackSource = orderRecoder[name][i];
                                    var tempArr = lackSource.split('.');
                                    var sourceRoot = window.LJS_SOURCE_ROOT || '/';
                                    var defaultUrl = sourceRoot + '/js/' + tempArr.join('/') + '.js';
                                    JSOBJ.loader( sourceUrl[ lackSource ] || defaultUrl );
                                }

                                var errorStr = '<' + orderRecoder[name][i] + '> is not exist!';
                                FUNCS.error.set('[Rely]', errorStr);
                                FUNCS.record.set('record', '[RELY]' + errorStr);
                                // 此处，通过借助“待运行”列表来辅助依赖关系处理，
                                // 当框架检测到本模块依赖的模块未运行时，则会将缺乏的模块存入列表
                                // 当检测到缺乏的模块定义时，则会运行之
                                if ( ctrlCenter.toBeRun.isDataOwn( 'toBeRun', name, 'name' ) == -1 ){
                                    ctrlCenter.toBeRun.set( 'toBeRun', {
                                        'name' : name,
                                        'poor' : orderRecoder[name][i]
                                    } );
                                }
                                return false;
                                // throw errorStr;
                            }
                        }
                    }
                }
                // 获取方法在方法存储库中的位置，并运行之
                var funcObjPos = ctrlCenter.scriptCenter.isDataOwn('__funcList__', name, 'name');
                if (funcObjPos > -1) {
                    var _func = funcsObj.splice(funcObjPos, 1)[0];
                    // 运行方法，得到运行后句柄
                    var handle = _func.func(LJS);
                    // 挂载方法到主区
                    PRIVATE.add(name, handle);
                    // 储存句柄
                    ctrlCenter.scriptCenter.set('__funcHandle__', {
                        'name': name,
                        'handle': handle
                    });
                    // 储存已运行方法
                    ctrlCenter.scriptCenter.set('__isRun__', name);
                    FUNCS.record.set( 'record', '[RUN] <' + name + '> has run!' );
                }
                // 每次执行成功，都检测当前执行的文件，是否满足待执行队列中的条件，如果满足，则执行初始化
                ctrlCenter.checkToBeRun( name );
                // 执行成功返回true
                return true;
            }
        },
        // 检测当前的模块是否能促使待执行列表中的模块的执行
        'checkToBeRun' : function ( name ) {
            var toBeRunList = ctrlCenter.toBeRun.get( 'toBeRun' );
            if ( toBeRunList ) {
                var toBeRunPos = ctrlCenter.toBeRun.isDataOwn( 'toBeRun', name, 'poor' );
                if ( toBeRunPos != -1 ) {
                    // 删除表中数据
                    var moduleName = ctrlCenter.toBeRun.remove( 'toBeRun', toBeRunPos );
                    ctrlCenter.run( moduleName.name );
                }
            }
        },
        'isRun': function (name) {
            var arr = ctrlCenter.scriptCenter.get('__isRun__');
            if (!arr) {
                return false;
            }
            return FUNCS.indexOf(name, arr) > -1 ? true : false;
        },
        'destroy': function (name) {
            var funcArr = ctrlCenter.scriptCenter.get('__funcHandle__');
            var handleArr = [];
            var funcObj;
            if ( !! name) {
                for (var i = 0; i < funcArr.length; i++) {
                    funcObj = funcArr[i];
                    (funcObj.name == name) && funcObj.handle && funcObj.handle.destroy && funcObj.handle.destroy();
                }
            } else {
                for (var i = 0; i < funcArr.length; i++) {
                    funcObj = funcArr[i];
                    funcObj.handle && funcObj.handle.destroy && funcObj.handle.destroy();
                }
            }
        }
    };

    // 脚本文件加载器
    var JSOBJ = {
        // 待加载js地址队列
        'priorityQueue': [],
        // 已加载历史记录
        'historyQueue': [],
        // 存储js加载状态，ture为正在加载，false为加载完成
        'busyState': {},
        // 加载全局锁，用于避免一个队列中，已加载(队列中已没有)和将要加载(要加入队列中)的重复
        'globalLock': false,
        // 添加到待加载队列，队列顺序根据其配置的权值
        'addQueue': function (srcUrl, conf) {
            var config = FUNCS.parseObj({
                'power': 0 // 权重
            }, conf || {}, true);
            JSOBJ.busyState[srcUrl] = true; // 状态繁忙
            var jsObj = {
                'src': srcUrl
            };
            JSOBJ.priorityQueue.splice(config.power, 0, jsObj);
        },

        'jsTagCreat': function (conf) {
            JSOBJ.globalLock = true; // 锁定全局
            var config = FUNCS.parseObj({
                'isAsyn': true,
                'callBack': function () {},
                'isClear': true // 是否在加载完成后清除script标签
            }, conf || {});
            // 遍历加载
            while (JSOBJ.priorityQueue.length > 0) {
                var temp = JSOBJ.priorityQueue.pop();
                var scriptNode = document.createElement('script');
                scriptNode.type = 'text/javascript';
                scriptNode.defer = config.isAsyn;
                scriptNode.src = temp.src;
                if (config.isAsyn) {
                    if ('onreadystatechange' in scriptNode) {
                        scriptNode.onreadystatechange = function () {
                            var rs = scriptNode.readyState;
                            if (rs.toLowerCase() == 'loaded' || rs.toLowerCase() == 'complete') {
                                config.callBack(temp.src);
                                JSOBJ.busyState[temp.src] = false; // 状态空闲
                                config.isClear && FUNCS.removeNode(scriptNode);
                            }
                        };
                    } else {
                        scriptNode.onload = function () {
                            config.callBack(temp.src);
                            JSOBJ.busyState[temp.src] = false; // 状态空闲
                            config.isClear && FUNCS.removeNode(scriptNode);
                        };
                    }
                }
                document.body.appendChild(scriptNode);
            }
            if (JSOBJ.priorityQueue.length == 0) {
                JSOBJ.globalLock = false;
            }
        },

        'loader': function (srcUrl, conf) {
            if (FUNCS.isArray(srcUrl)) {
                for (var i = 0; i < srcUrl.length; i++) {
                    JSOBJ.loader(srcUrl[i], conf);
                }
                return;
            }
            var srcUrl = FUNCS.trim(srcUrl);
            // 查阅加载历史记录，保证js不重复加载
            if (FUNCS.indexOf(srcUrl, JSOBJ.historyQueue) != -1) {
                FUNCS.error.set('[jsLoader]', 'repeat loader for ' + srcUrl);
                return false;
            }
            var config = FUNCS.parseObj({
                'isAsyn': true,
                'power': 0,
                'isClear': true,
                'callBack': function () {}
            }, conf || {}, true);
            // 创建历史加载记录
            JSOBJ.historyQueue.push(srcUrl);
            // 进行添加到加载队列的一系列操作
            JSOBJ.addQueue(srcUrl, config);
            if (!JSOBJ.globalLock) {
                JSOBJ.jsTagCreat(config);
            }
        }
    };

    /*
     * Rely 方法，用于保证代码间的依附关系，
     * 避免组件的运行先于其依赖的其它组件，
     * 避免出现未定义就运行的情况。
     * 并不拉取文件，仅拉取文件间的依赖关系
     */
    var sourceUrl = {};
    var Rely = function ( name, jsUrl ) {
        jsUrl && (sourceUrl[ name ] = jsUrl);
        PRIVATE.importTemp.reg(name, '__i__'); // 只记录顺序，最后统一在运行时保证初始化顺序
    };

    // 全局缓存，用于各个模块间的缓存使用
    var GLOBALCache = FUNCS.dataCenter();
    GLOBALCache.about = 'Global cache for all of the defined functions, just like \'window\'.';
    delete GLOBALCache.destroy;

    /*=============
     * 抛出方法
     *=============
     */
    return {
        'version'   : version,
        'FUNCS'     : FUNCS,                    // 基础方法组件，提供基础的一系列方法
        'error'     : FUNCS.error.show(),       // 错误日志，用于记录运行中的错误
        'record'    : FUNCS.record.show(),      // 日志管理，用于记录所有已注册方法的首次运行行为
        'define'    : ctrlCenter.define,        // 定义方法
        'run'       : ctrlCenter.run,           // 执行注册方法的初始化
        'isRun'     : ctrlCenter.isRun,         // 判断某一方法是否已经初始化
        'Rely'      : Rely,                     // 导入方法，用于处理组件间的依赖关系
        'logic'     : LOGICFUNS,                // 注册的组件将全部挂载到这个区域下
        'jsLoader'  : JSOBJ.loader,             // js加载模块
        'destroy'   : ctrlCenter.destroy,       // 销毁方法
        'GLOBAL'    : GLOBALCache
    };
})();
}
/**
 * 基础公用方法定义，提供最常用的功能
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
LJS.define( 'base', function ( $ ) {
    var MAIN = {};
    MAIN.strToJson = function (str) {
        if (str == undefined) {
            return {};
        }
        var reg = /([^\?&\&]+)/g;
        var temp = str.match(reg);
        var resultObj = {};
        for (var i = 0; i < temp.length; i++) {
            var str = temp[i];
            var strArr = str.split('=');
            if (strArr.length >= 2) {
                resultObj[strArr[0]] = strArr[1];
            }
        }
        return resultObj;
    };

    // 对象转字符串, isEncode表示是否进行编码
    MAIN.jsonToStr = function (obj, isEncode) {
        var str = '';
        var temp = [];
        for (var i in obj) {
            var tempV = obj[i].toString();
            if ( isEncode ) {
                i = encodeURIComponent( i );
                tempV = encodeURIComponent( tempV );
            }
            temp[temp.length] = (i + '=' + tempV);
            temp[temp.length] = ( '&' );
        }
        temp.pop(); // 弹出最后一个&
        str = temp.join('');
        return str;
    };

    // 判断数组
    MAIN.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    // 判断数据类型，完整支持所有数据类型,检测Array是否为object时，会返回false
    MAIN.isWhat = function ( v, type ) {
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

    // 判断obj内部是否有某值（非键）
    MAIN.isObjOwn = function (val, obj) {
        for (var i in obj) {
            if (obj[i] === val) {
                return true;
            }
        }
        return false;
    };
    // 对象合并，isNumParse表示是否转换为数值类型
    MAIN.parseObj = function (rootObj, newObj, isNumParse) {
        var tempObj = {};
        var newObj = newObj || {};
        for (var i in rootObj) {
            tempObj[i] = rootObj[i];
            if (i in newObj) {
                var temp = newObj[i];
                var parseVal = parseFloat(temp);
                if (isNumParse && !isNaN(parseVal)) {
                    temp = parseVal;
                }
                tempObj[i] = temp;
            }
        }
        return tempObj;
    };

    // getkey获取唯一值
    MAIN.getKey = function () {
        var date = new Date();
        return date.getTime();
    };

    // array索引
    MAIN.indexOf = function (item, arr) {
        if (!MAIN.isArray(arr)) {
            return false;
        }
        if (typeof arr.indexOf != 'undefined') {
            MAIN.indexOf = function (otherItem, otherArr) {
                return otherArr.indexOf(otherItem);
            };
        } else {
            MAIN.indexOf = function (otherItem, otherArr) {
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
        return MAIN.indexOf(item, arr);
    };

    // 复制一个对象，如果是数组则复制后依然为数组
    MAIN.copyObj = function (obj) {
        if (MAIN.isArray(obj)) {
            return obj.slice(0);
        }
        var temp = {};
        for (var i in obj) {
            var tempObj = obj[i];
            if ((typeof obj[i]).toLowerCase() == 'object') {
                tempObj = MAIN.copyObj(obj[i]);
            }
            temp[i] = tempObj;
        }
        return temp;
    };

    // check node   @param node (| nodeType值)
    MAIN.isNode = function ( node, TypeVal ) {
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
    MAIN.objLength = function ( obj ) {
        var l = 0;
        for( var i in obj ) {
            if( obj.hasOwnProperty( i ) ) {
                l++;
            }
        }
        return l;
    };

    // 数组去重，delFirst可选，表示对重复元素是否删除索引值小的，保留靠后的
    MAIN.concatArrOnly = function (arr1, arr2, delFirst) {
        var len1 = arr1.length,
            len2 = arr2.length,
            forRoot = len1 >= len2 ? arr2 : arr1,
            indexArr =  len1 < len2 ? arr2 : arr1,
            pos;
        for(var i in forRoot){
            pos = MAIN.indexOf(forRoot[i], indexArr);
            if(pos > -1){
                delFirst && forRoot.splice(i, 1);
                !delFirst && indexArr.splice(pos, 1);
            }
        }
        return arr1.concat(arr2);
    };

    // 获取节点上的对应属性值，同时对该值进行query到json的转化
    MAIN.getData = function ( el, attrName ) {
        attrName = attrName || 'action-data';
        var str = el.getAttribute( attrName );
        if ( typeof str == "undefined" ) {
            return {};
        }
        var reg = /([^\?&\&]+)/g;
        var temp = str.match(reg);
        var resultObj = {};
        for (var i = 0; i < temp.length; i++) {
            var str = temp[i];
            var strArr = str.split('=');
            if (strArr.length >= 2) {
                resultObj[strArr[0]] = strArr[1];
            }
        }
        return resultObj;
    };

    // 设置节点上的对应属性值
    MAIN.setData = function ( el, dataObj, attrName ) {
        attrName = attrName || 'action-data';
        var str = el.getAttribute( attrName );
        var existData = {};
        if ( typeof str != "undefined" ) {
            var reg = /([^\?&\&]+)/g;
            var temp = str.match(reg);
            existData = {};
            for (var i = 0; i < temp.length; i++) {
                var str = temp[i];
                var strArr = str.split('=');
                if (strArr.length >= 2) {
                    existData[strArr[0]] = strArr[1];
                }
            }
        }
        for ( var j in dataObj ) {
            existData[ j ] = dataObj[ j ];
        }
        el.setAttribute( attrName, MAIN.jsonToStr( existData ) );
    };

    // 获取当前页面的滚动条位置
    MAIN.scrollPos = function () {
        return {
            't': document.documentElement.scrollTop || document.body.scrollTop,
            'l': document.documentElement.scrollLeft || document.body.scrollLeft
        }
    };

    // 表单提交不跳页,jsonp
    MAIN.formUp = function ( formNode, conf ) {
        var config = MAIN.parseObj( {
            'method' : 'post',
            'action' : '',
            'enctype': 'multipart/form-data',
            'extraD' : {},
            'cbkName': 'jsonp',
            'cbk'    : function () {}
        }, conf );
        if ( !config.action ) {
            return;
        }
        var transData = config.extraD;
        transData.jsonp = config.cbkName;

        var iframN;
        // Input创建器
        var inputCreator = function ( data ) {
            var arr = [];
            for ( var i in data ) {
                if ( data.hasOwnProperty( i ) ) {
                    arr[arr.length] = '<input type="hidden" name=' + i + ' value=' + data[i] + ' />';
                }
            }
            var randomKey = MAIN.getKey();
            arr.push( '<input type="hidden" name="_rd" value="' + randomKey + '"" />' )
            return arr.join('');
        };

        var iframCreat = function () {
            var unikey = 'formIframe_' + MAIN.getKey();
            iframN = document.createElement( 'iframe' );
            iframN.setAttribute( 'name', unikey );
            iframN.style.display = 'none';
            document.body.appendChild( iframN );
            return unikey;
        };

        var hiddenBox = document.createElement( 'div' );
        hiddenBox.style.display = 'none';
        hiddenBox.innerHTML = inputCreator( transData );
        formNode.appendChild( hiddenBox );


        var iframeKey = iframCreat();
        formNode.setAttribute( 'method', config.method );
        formNode.setAttribute( 'action', config.action );
        formNode.setAttribute( 'target', iframeKey );
        formNode.setAttribute( 'enctype', config.enctype );
        iframN.onload = function () {
            config.cbk( iframN.contentWindow[ config.cbkName ] || {} );
            hiddenBox.parentNode.removeChild( hiddenBox );
            document.body.removeChild( iframN );
        };
        formNode.submit();
    };

    // 获取路径中的最后小截
    MAIN.getPath = function ( path, pathSplit ) {
        var splitA = ( path || '' ).split( pathSplit || '\\' );
        var splitAL = splitA.length;
        return splitAL ? splitA[ splitAL - 1 ] : '';
    };

    // 将字符串中的html标签变成转义字符
    MAIN.encodeHTML = function ( str ) {
        // var tempEl = document.createElement('textarea');
        // tempEl.value = str;

        str = str.replace( /\&/g, '&amp;' );
        str = str.replace( /\>/g, '&gt;' );
        str = str.replace( /\</g, '&lt;' );
        str = str.replace( /\"/g, '&quot;' );
        return str;
        
        // return tempEl.innerHTML;
    };

    // 对象相减，内容相同则返回false，仅支持一维
    MAIN.ObjMinus = function ( firstObj, secondObj ) {
        if ( !MAIN.isWhat( firstObj, 'object' ) 
                || !MAIN.isWhat( secondObj, 'object') ) {
            throw 'params type error!';
        }
        var obj = {},
            flag = 0;
        for ( var i in firstObj ) {
            if ( secondObj.hasOwnProperty( i ) ) {
                if ( secondObj[ i ] != firstObj[ i ] ) {
                    obj[ i ] = secondObj[ i ];
                    flag = 1;
                }
            }
        }
        if ( !flag ) {
            obj = false;
        }
        return obj;
    };

    return MAIN;
});

/**
 * 将某个占位符替换为对应的数据，占位符的格式为#{name}
 * @param 待处理字符串 数据对象
 * @return 处理之后的字符串
 */
LJS.Rely( 'base' );
LJS.define( 'str.replace', function ( $ ) {
    var $b = $.logic.base;
    return function ( str, data ) {
        if ( !$b.isWhat( str, 'string' ) ) {
            throw '[str.replace]: need string as first parameter!';
        }
        var reg = /\#\{([a-zA-Z\_\-0-9]+)\}/g;
        var result = str.replace( reg, function (){
            var ar = $b.isWhat( data[arguments[1]], 'undefined' ) ? arguments[0] : data[arguments[1]];
            return ar;
        } );
        return result;
    };
});
// 初始化执行方法
LJS.run();