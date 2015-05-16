requirejs.config({
    baseUrl: '_shadow_src',
    paths: {
        text: '../js/_shadow_require-text'
    }
});
//Caveat: not require('entrypoint')!;
require(['entrypoint'], function(app){
	$(function(){app.start();});
});
