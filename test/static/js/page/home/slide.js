(function () {
    var module = $M.define('page.home.slide');
    var $B = module.tools;

    module.require( 'page.home.ani' );
    module.build( 'init', function ( node, spec ) {
        if( !$B.isNode( node ) ) {
            throw module.mName + ' need node as first parameter!';
        }
        $M.create('page.home.ani', 'lp');
        console.log(module.mName,$M.modules.page.home.ani)
        return {
            'test':'test',
            'ani' : $M.modules.page.home.ani.me
        };
    } );
})();