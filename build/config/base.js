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
 * 		watch path:hooks, 
 * 		js[es6?plain? + vendor], 
 * 		assets, 
 * 		production[minify?gzip?]
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
 * @author Tim Lauv
 * @created 2015.02.19
 *
 */

exports.config = {

	//---------------dist path--------------
	output: 'public',

	//-----------inified & gzipped?---------
	production: false,
	
	//--------------js targets--------------
	//[] --> use concat only, 
	//'.js' --> as commonjs module and use browserify
	//
	es6: true, //only applies to commonjs targets)
	js: {
		//app.js
		app: 'app/main.js',

		//vendor.js
		vendor: []
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
		vendor: []
	},

	//------------templates.json------------
	templates: ['app/**/*.tpl.html'],

	//----------------assets----------------
	assets: ['assets/*'],

	//---------gulp plugin configs----------
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