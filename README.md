BModuleJs 2.0.3
======

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

### Dependence treatment
__eg.__

    var module = $M.define('page.home.main');
    var $B = module.tools;
    var $mods = $M.modules;
    // Dependence treatment,use "require"
    module.require( 'page.home.slide' );
    module.require( 'common.plugins.tab' );
    // build init function, 
    // which will be called on "module.create()"(the same with $M.create('page.home.main'))
    module.build( 'init', function () {
        console.log(module.mName);
        $M.create( 'page.home.slide', document.body );
        $M.create( 'common.plugins.tab', $('#tabtest')[0] );
    } );
    module.create();
    

### Strapping Tools
__Step 1.the first time you use this tools__
    
    # enter dir
    cd xxxx
    npm install
    
__Step 2.__

    grunt bmodule:filepath[:target:prefix:isUglify]
    # filepath: the file or path you want to strap.
    # target: the target path or file path for stapped file.
    # prefix: the same with "$M.options('sourceRoot', 'static/js/');" value.
    # isUglify: need to compress.use "0" or "1" to turn off or turn on it.
    eg.
    grunt bmodule:static/js/::static/js/:0
    
### Skills
__Script tag__
    
    <!--Use bmodule to load js.the attribute "after" will be loaded after "msrc"-->
    <script msrc="static/js/common/base.js" after="page/home/main.js"></script>
    
