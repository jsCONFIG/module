$M.define('common/test', function (module, $T, mods) {
    module.require('common/data');

    return function () {
        return {
            say: 'From ' + module.mName
        };
    };
}).create();