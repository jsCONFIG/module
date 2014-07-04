(function () {
    var module = $M.define('common.plugins.strTools');
    var $B = module.tools;

    module.build( 'init', function () {
        var FUNCS = {};
        // 字符串转对象
        FUNCS.strToJson = function (str) {
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
        FUNCS.jsonToStr = function (obj, isEncode) {
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
        return FUNCS;
    } );
})();