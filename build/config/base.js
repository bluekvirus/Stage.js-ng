/**
 * This is the base configure file for the build process.
 * (Do NOT modify unless you want to apply to all build configures)
 * 
 * Base Path
 * ---------
 * All path are based on the project root. [not this configure file]
 *
 * Configure
 * ---------
 * 1. plugins:
 * 	  	settings for the plugins.
 * 2. control aspects: 
 * 		dist path,
 * 		production[minify?gzip?],
 * 		watch [incremental build?],
 * 		js[es6?commonjs? + vendor],
 * 		css,
 * 		template, 
 * 		assets (copy, rename (with jsminification))
 *
 * Override (create another configure)
 * -----------------------------------
 * Use the following code:
 * 
 * ```
 * 
 * var extend = require('extend');
 * var base = require('./base.js');
 * exports.config = extend(true, base, {
 * 		//deep extending the base configure...
 * });
 * 
 * ```
 * 
 * Gotcha
 * ------
 * Enable es6 only affects commonjs modules.
 * You can NOT use es6 in this build tool without 'require()'.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 *
 */

exports.config = {

	//---------------dist path--------------
	output: 'public',

	//----------------watch-----------------
	watching: false,

	//-----------minified & gzipped?--------
	//production build will ignore the watching flag above.
	production: false,
	
	//--------------js targets--------------
	//[] --> use concat only, 
	//'.js' --> as commonjs module and use browserify
	//
	es6: true, //only applies to commonjs targets
	js: {
		//app.js
		app: 'app/main.js',

		//vendor.js
		vendor: [
			'libs/bower_components/jquery/dist/jquery.js',
			'libs/vendor/jquery-ui/position.js',
			'libs/bower_components/director/build/director.js',
			'libs/bower_components/reactive/reactive.js',
			'libs/vendor/kube/js/kube.js'
		]
	},

	//--------------css targets-------------
	//[] --> use concat only, 
	//'.less' - lessc, 
	//'.scss' - scss (TBI)
	//
	css: {
		//main.css
		main: 'app/main.less',

		//vendor.css
		vendor: [
			'libs/bower_components/fontawesome/css/font-awesome.css',
			'libs/vendor/kube/css/kube.css'
		]
	},

	//------------templates.json------------
	//
	templates: ['app/**/*.tpl.html'],

	//----------------assets----------------
	//'string' --> as glob, copy as is
	//{key: value} --> copy & rename/path
	//
	//note that overlapping path will be merged.
	//
	assets: [
		'assets/**/*',
		{'libs/bower_components/modernizr/modernizr.js':'js/modernizr.js'},
		{'libs/bower_components/fontawesome/fonts':'fonts'}
	],

	//----------gulp plugin configs---------
	//
	plugins: {

		less: {},
		autoprefixer: {},
		cleancss: {},
		
		babelify: {}, //es6
		browserify: {}, //commonjs
		
		uglify: {},
		gzip: {}

	},
};