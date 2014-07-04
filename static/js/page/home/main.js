(function () {
    var module = $M.define('page.home.main');
    var $B = module.tools;
    var $mods = $M.modules;

    module.require( 'page.home.slide' );
    module.require( 'common.plugins.tab' );
    module.build( 'init', function () {
        console.log(module.mName);
        $M.create( 'page.home.slide', document.body );
        $M.create( 'common.plugins.tab', $('#tabtest')[0] );
    } );
    module.create();
})();