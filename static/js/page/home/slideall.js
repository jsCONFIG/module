(function () {
    var module = $M.define('page.home.slide');
    var $B = module.tools;

    module.require( 'page.home.ani' );
    module.build( 'init', function ( node, spec ) {
        if( !$B.isNode( node ) ) {
            throw module.mName + ' need node as first parameter!';
        }
        $M.create('page.home.ani', 'lp');
        console.log(module.mName);
        return {
            'test':'test',
            'ani' : $M.modules.page.home.ani.me
        };
    } );
    var module1 = $M.define('page.home.ani');
    var $B = module1.tools;

    module1.build( 'init', function ( node, spec ) {
        console.log(module1.mName);
        return {
            'name' : 'ani'
        }
    } );
})();