(function(app){

	requirejs.config({
	    baseUrl: '_shadow_src',
	    urlArgs: app.param('debug')?'bust=' + (new Date()).getTime():'',
	    paths: {
	        text: '../js/_shadow_require-text'
	    }
	});
	//Gotcha: not require('entrypoint')!;
	require(['entrypoint']);

})(Application);

