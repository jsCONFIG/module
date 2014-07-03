(function () {
    var module = $M.define('common.base');
    var $B = module.tools;
    $M.options('sourceRoot', 'test/static/js/');
    $M.path._set( 'zepto1.1.3', 'common/zepto-1.1.3.min.js' );
    $M.path._set( 'jquery1.11.1', 'common/jquery-1.11.1.min.js' );

    module.build( 'init', function () {
        $B.jsLoader( '__proto__' in {} ? $M.path['zepto1.1.3'] : $M.path['jquery1.11.1'] );
    } );
    module.create();
})();