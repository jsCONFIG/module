/**
 * 数据库逻辑
 */
$M.define('common/database', function (module, $T, mods, ms) {
    var _eachObj = function ( obj, fn ) {
        var flag;
        for( var i in obj ) {
            if( obj.hasOwnProperty( i ) ) {
                flag = fn( i, obj[i] );
                if( flag === false ) {  
                    return;
                }
            }
        }
    };

    var _isArray = function ( arr ) {
        return arr.constructor == Array;
    };

    var _indexOf = function ( arr, val ) {
        var pos = -1;
        if( arr.indexOf ) {
            pos = arr.indexOf( val );
        }
        else {
            for( var i = 0, arrL = arr.length; i < arrL; i++ ) {
                if( arr[i] === val ) {
                    return i;
                }
            }
        }
        return pos;
    };

    // 取数据交集，不影响源
    var _mixed = function ( arrA, arrB ) {
        if( !_isArray( arrA ) ) {
            arrA = [ arrA ];
        }
        if( !_isArray( arrB ) ) {
            arrB = [ arrB ];
        }

        var arr = [];
        for( var i = 0, l = arrA.length; i < l; i++ ) {
            if( _indexOf( arrB, arrA[i] ) != -1 ) {
                arr.push( arrA[i] );
            }
        }
        return arr;
    };

    var _parseIdx = function ( spec, idx ) {
        if( !spec || !spec.idx ) {
            return false;
        }
        for( var i = 0, idxL = spec.idx.length; i < idxL; i++ ) {
            idx[ spec.idx[ i ] ] = new Class_index();
            
        }
        return true;
    };


    // db
    var Class_db = function ( spec ) {
        this.data = {};
        this.idx = {};
        this.total = 0;
        this.cur = 0;

        // 主键名称
        this.primaryKey = spec.primary;

        // 设置索引，虚保证索引和主键不能兼任
        _parseIdx( spec, this.idx );
    };

    // 检测数据是否符合当前db，仅检测主键
    Class_db.prototype.checkData = function ( data ) {
        var priVal = false;
        if( !this.primaryKey ) {
            priVal = this.cur;
        }
        else if( this.primaryKey && data.hasOwnProperty( this.primaryKey ) ) {
            priVal = data[ this.primaryKey ];

            // 保证主键值的唯一性
            if( this.data.hasOwnProperty( priVal ) ) {
                return false;
            }
        }
        else {
            return false;
        }
        return priVal;
    };

    // 新建一条数据
    Class_db.prototype.create = function( data ) {
        var priVal,
            self = this;

        // 检测数据合法性
        priVal = this.checkData( data );
        if( priVal === false ) {
            return false;
        }

        // 创建索引
        _eachObj( data, function ( i, item ) {
            if( self.idx.hasOwnProperty( i ) ) {
                // 添加索引，item为改索引项对应数据中的值，priVal为当前数据的主键
                self.idx[i].set( item, priVal );
            }
        });

        this.state = 1;
        this.data[ priVal ] = data;
        this.total++;
        this.cur++;
        return true;
    };

    // 输入主键(列表)，返回对应数据
    Class_db.prototype.getPrimaryData = function ( priVal ) {
        if( !_isArray( priVal ) ) {
            priVal = [priVal];
        }

        var result = [];
        for( var i = 0, priL = priVal.length; i < priL; i++ ) {
            var item = priVal[i].toString();

            if( this.data.hasOwnProperty( item ) ) {
                result.push( this.data[item] );
            }
        }
        return result;
    };

    // 常规的循环查找，只针对一维数据
    Class_db.prototype.normalGet = function ( key, val, onlyPrimary ) {
        var result = [];

        _eachObj( this.data, function ( i, item ) {
            if( item.hasOwnProperty( key ) && item[ key ] === val ) {
                result.push( onlyPrimary ? i : item );
            }
        });

        return result;
    };

    // 获取数据，返回数据数组 / 对应主键位置数组
    Class_db.prototype.get = function ( whereObj, onlyPrimary ) {
        var self = this,
            result = [];

        // return false 则跳出循环，如果此时为得到result值，则会导致返回结果为空
        _eachObj( whereObj, function ( i, item ) {
            if( self.primaryKey && i == self.primaryKey ) {
                // 主键设置了的情况下，如果该值不存在，则直接返回
                if( !self.data.hasOwnProperty( item ) ) {
                    result = [];
                    return false;
                }

                // 暂存数据，待下一步过滤
                if( result.length ) {
                    result = _mixed( result, onlyPrimary ? item : [self.data[item]] );
                }
                else {
                    result = [onlyPrimary ? item : self.data[ item ]];
                }
            }

            // 索引判断
            else if( self.idx.hasOwnProperty( i ) ) {
                var idx = self.idx[ i ],
                    idxItem = idx.get( item );

                if( idxItem && idxItem.length ) {
                    var tmpResult = onlyPrimary ? idxItem.get() : self.getPrimaryData( idxItem.get() );
                    // 取数据交集
                    if( result.length ) {
                        result = _mixed( result, tmpResult );
                    }
                    else {
                        result = tmpResult;
                    }
                }
                else {
                    result = [];
                    return false;
                }
            }

            // 普通键判断，依照最原始的循环搜索
            else {
                var tmpResult = self.normalGet( i, item, onlyPrimary );
                if( result.length ) {
                    result = _mixed( result, tmpResult );
                }
                else {
                    result = tmpResult;
                }
            }
        });

        return result;
    };

    // 删除一条数据
    Class_db.prototype.del = function ( whereObj ) {
        var self = this;
        // 先获取查找的对应主键
        var primaryKeys = self.get( whereObj, true );
        if( !primaryKeys.length ) {
            return false;
        }

        for( var i = 0, pkL = primaryKeys.length; i < pkL; i++ ) {
            var key = primaryKeys[ i ];

            // 删除索引
            _eachObj( self.idx, function ( j, item ) {
                // 先检测该数据项是否存在当前的索引内容
                // debugger;
                var tmp = self.data[ key ].hasOwnProperty( j );
                tmp && item.del( self.data[ key ][ j ], key );
            });

            // 删除数据
            delete self.data[ key ];
        }

        // 更新长度
        self.total -= primaryKeys.length;
        return true;
    };

    // 更新数据，不修改主键
    Class_db.prototype.update = function ( whereObj, dataVal ) {
        var self = this;
        // 如果设置了主键，则修改数据时不变更主键
        if( self.primaryKey ) {
            delete dataVal[ self.primaryKey ];
        }

        var primaryKeys = self.get( whereObj, true );

        if( !primaryKeys.length ) {
            return false;
        }

        for( var i = 0, pkL = primaryKeys.length; i < pkL; i++ ) {
            var key = primaryKeys[ i ];

            // 更新索引
            _eachObj( self.idx, function ( j, item ) {
                // 先检测新数据会不会修改该索引对应的值
                dataVal.hasOwnProperty( j ) && item.update( key, self.data[ key ][ j ], dataVal[ j ] );
            });

            // 更新数据
            var tmpData = self.data[ key ];
            _eachObj( dataVal, function ( j, val ) {
                tmpData[ j ] = val;
            });
        }

        return true;
    };

    // index
    var Class_index = function () {
        // 该索引数据
        this.dataIdx = {};

    };

    // 这里的key一般为该索引的值，val一般为对应的主键值
    Class_index.prototype.set = function( key, val ) {
        key = key.toString();
        if( !this.dataIdx.hasOwnProperty( key ) ) {
            this.dataIdx[ key ] = new Class_indexBase();
        }

        this.dataIdx[ key ].add( val );
        return true;
    };

    // 当前索引中的值，key为该索引的值
    Class_index.prototype.get = function( key ) {
        key = key.toString();
        if( this.dataIdx.hasOwnProperty( key ) ) {
            return this.dataIdx[ key ];
        }
        else {
            return null;
        }
    };

    Class_index.prototype.del = function ( key, val ) {
        key = key.toString();
        if( key === '' || !this.dataIdx.hasOwnProperty( key ) ) {
            return false;
        }

        this.dataIdx[ key ].del( val );

        if( !this.dataIdx[ key ].length ) {
            delete this.dataIdx[ key ];
        }
        return true;
    };

    // 更新数据， 对应：主键值， 老的索引的值，新的索引的值
    Class_index.prototype.update = function ( priVal, oldKey, newKey ) {
        if( this.dataIdx[ oldKey ] ) {
            this.dataIdx[ oldKey ].del( priVal );

            // 清除无用索引
            if( !this.dataIdx[ oldKey ].length ) {
                delete this.dataIdx[ oldKey ];
            }
        }

        if( !this.dataIdx[ newKey ] ) {
            this.dataIdx[ newKey ] = new Class_indexBase();
        }
        this.dataIdx[ newKey ].add( priVal );
    };


    /**
     * 单个索引值项的管理
     */
    var Class_indexBase = function () {
        this.idxItem = [];
        this.length = 0;
    };

    Class_indexBase.prototype.get = function () {
        return this.idxItem.slice( 0 );
    };

    // 这里的val对应于整个db中的某个主键值，值唯一
    Class_indexBase.prototype.add = function( val ) {
        // 表示已存在
        if( _indexOf( this.idxItem, val ) != -1 ) {
            return false;
        }

        this.idxItem.push( val );
        this.length = this.idxItem.length;
        return true;
    };

    // val同上
    Class_indexBase.prototype.del = function( val ) {
        var pos;
        if( (pos = _indexOf( this.idxItem, val ) ) == -1 ) {
            return false;
        }

        this.idxItem.splice( pos, 1 );
        this.length = this.idxItem.length;
        return true;
    };

    Class_indexBase.prototype.has = function ( val ) {
        return (_indexOf( this.idxItem, val ) != -1);
    };

    // If the return type is "function", which will be run automatically.
    // So, use a function to wrap the Class.
    return function () {
        return Class_db;
    };

}).create();