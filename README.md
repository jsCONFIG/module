module
======

#### About
A Controller For Modules.You can use it as javascript modules controller, which can help you to make your code more structured.
You can also use it to tracking code by use the function "$M.tailLog('process')" so that you can see the running log of the modules.

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
