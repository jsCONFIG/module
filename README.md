BModuleJs 2.0.7
======

[![Bmodulejs](http://img.shields.io/npm/v/bmodulejs.svg)](https://www.npmjs.org/package/bmodulejs) [![Bmodulejs](http://img.shields.io/npm/dm/bmodulejs.svg)](https://www.npmjs.org/package/bmodulejs)

#### About
A Controller For Modules.You can use it as javascript modules controller, which can help you to make your code more structured.
You can also use it to tracking code by use the function "module.tailLog('process')" so that you can see the running log of the modules.

    # You can get it by: 
    npm install bmodulejs

### API
__$M.define( mNameStr );__

    Define a new module.
    @param {string} [mNameStr] module name, use "." to split namespace.
    @return {object}
    var module = $M.define( 'page.home.main' );
    
__$M.create( nameStr, spec, cbk );__

    Create a module which you have defined by function "$M.define"
    @param {string} [nameStr] module name.
    @param {array|all} [spec] parameter for modules on creating.
    @param {function} [cbk] callback
    
__$M.modules;__

    A namespace for modules.All of the modules will be added to this object.
    So, you can use those modules you added by this way.
    
__$M.destroy( nameStr );__

    The way to destroy a module.
    
__$M.expendT( fnName, fn );__

    The way to expend $M.tools.
    
__$M.getModule( nameStr );__

    The way to get module by name string.
    
__$M.jsLoader( src, conf );__

    Js loader.
    @param {object} conf 
                { 
                    'cbk' : function (){},
                    'isAsync' : false,
                    'isClear' : false,
                    'sudo' : false'
                }
    
__$M.options();__

    Settings.
    
__$M.path();__

    Javascript src setting.
    
__$M.reload( nameStr );__

    Reloading those modules which loaded by bmodulejs.
    
__$M.tools;__

    Some tools functions.

### Dependence treatment
__eg.__

    ~function () {
    var module = $M.define( 'home/init' );
        // get it when "create" be called.
        module.require( 'common/database' );
        var mods = $M.modules;
        module.build( 'init', function () {
            console.log( arguments );
            var nd = document.getElementById( 'example' );
            var dataConf = {
                'idx' : ['num', 'name', 'age']
            };
            var database = new mods.common.database.me( dataConf );
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
        });
        module.create('Arguments for init function.');
    }();
    

### Strapping Tools
__Step 1.the first time you use this tools__
    
    # enter dir
    cd xxxx
    npm install
    
__Step 2.__

    grunt bmodule:filepath[:target:prefix:isUglify]
    # filepath: the file or path you want to strap.
    # target: the target path or file path for strapped file.
    # prefix: the same with "$M.options('sourceRoot', 'static/js/');" value.
    # isUglify: need to compress.use "0" or "1" to turn off or turn on it.
    eg.
    grunt bmodule:static/js/::static/js/:0
    
### Skills
__Script tag__
    
    <!--Use bmodule to load js.the attribute "after" will be loaded after "msrc"-->
    <script src="source/bmodulejs-2.0.7.js" msrc="static/js/common/base.js" after="static/js/home/init.js"></script>
