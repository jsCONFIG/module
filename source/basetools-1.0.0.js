/**
 * 提供基础的方法，不涉及业务逻辑
 * @param  {[type]} $W [description]
 * @return {[type]}    [description]
 */
( function ( $W ) {
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

    $W.basetools = $BASE;
})( window );