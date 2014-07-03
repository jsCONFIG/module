(function () {
    var module = $M.define('page.home.ani');
    var $B = module.tools;

    module.build( 'init', function ( node, spec ) {
        console.log('From ani!', node);
        return {
            'name' : 'ani'
        }
    } );
})();