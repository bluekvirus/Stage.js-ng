(function(app){

	if(!app.isAMDEnabled()) return;

	app.config({
		amd: {
			baseURL: 'amd', //where to load src. Don't modify this, see task:amd (amdFolderName) in build!
			commonRoot: '' //strip off commonRoot path during `path -> name` conversion. (e.g 'vanilla/')
		} 
	});

	requirejs.config({
	    baseUrl: app.amd.baseURL,
	    urlArgs: app.param('debug')?'bust=' + (new Date()).getTime():'',
	    paths: {
	        text: '../js/require-text' //Don't modify this, see task:amd in build!
	    }
	});
	//Gotcha: not require('entrypoint')!;
	require(['entrypoint']);

})(Application);

