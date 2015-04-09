$M.define('home/init', function (module, $T, mods, ms) {
    // get it when "create" be called.
    module.require( 'common/database' );

    return function () {
        console.log( arguments );

        var nd = document.getElementById( 'example' );

        var dataConf = {
            'idx' : ['num', 'name', 'age']
        };
        var database = new mods.common.database( dataConf );

        for( var i = 0; i < 99999; i++ ) {
            database.create( {
                'num'   : i,
                'name'  : 'BottleLiu' + i,
                'age'   : i % 24
            } );
        }

        var str = '';

        var strTotal = 'Data length: ' + database.total + '<br><br>';

        var strGet = 'The length of data which age equal 23: ' + database.get({'age' : 23}).length;

        str = strTotal + strGet;

        nd.innerHTML = str;

        return database;
    };
}).create('Arguments for init function.');