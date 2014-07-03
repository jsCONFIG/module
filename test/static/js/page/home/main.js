(function () {
    var module = $M.define('page.home.main');
    var $B = module.tools;
    var $mods = $M.modules;

    module.require( 'page.home.slide' );
    module.build( 'init', function () {
        $M.create( 'page.home.slide', document.body );
        console.log(module.mName, $mods.page.home.slide.me );
    } );
    module.create();
})();