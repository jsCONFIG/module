(function () {
    var module = $M.define('common.base');
    var $B = module.tools;
    $M.options('sourceRoot', 'static/js/');
    $M.path.set( 'zepto1.1.3', 'static/js/common/zepto-1.1.3.min.js' );
    $M.path.set( 'jquery1.11.1', 'static/js/common/jquery-1.11.1.min.js' );

    module.build( 'init', function () {
        $M.jsLoader( '__proto__' in {} ? $M.path.get('zepto1.1.3') : $M.path.get('jquery1.11.1') );
    } );
    module.create();
})();