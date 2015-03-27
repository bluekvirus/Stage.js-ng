/**
 * This is the base configure file for the build process.
 * (Do NOT modify unless you want to apply to all build configures)
 * 
 * Base Path
 * ---------
 * All path are based on the project root. 
 * [which is the same level of the build folder and not this configure file]
 *
 * Configure
 * ---------
 * 1. plugins:
 * 	  	settings for the plugins.
 * 2. control aspects: 
 * 		dist path,
 * 		production[minify?gzip?],
 * 		watch [incremental build?],
 * 		js[es6 + vendor concat],
 * 		css,
 * 		template, 
 * 		assets (copy, rename (with jsminification))
 *
 * Override (create another configure)
 * -----------------------------------
 * use `gulp -C <name> or --config <name>` to load up other configure file instead of this one.
 *
 * *Hint*: how to create another configure file? 
 * ```
 * 		module.exports = require('lodash').merge(require('.default'), {
 * 			...
 * 		 	...
 *   	});
 * ```
 * 
 * Gotcha
 * ------
 * 1. All non-concatenated .js files will be treated as es6, thus should use `import` and `expose` module key words.
 * 2. Concatenated lib and vendor .js files can be used directly using their globally exposed vars.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 *
 */

module.exports = {

	//---------------dist path--------------
	output: 'public',

	//----------------watch-----------------
	watching: false,

	//-----------minified & gzipped?--------
	//applies to all js, css and index.html
	production: false,
	
	//------------concat libs.js----------
	libs: [
		'libs/bower_components/jquery/dist/jquery.js',
		'libs/vendor/jquery-ui/position.js',
		'libs/bower_components/lodash/lodash.js',
		'libs/bower_components/director/build/director.js',
		'libs/bower_components/ractive/ractive.js',
	],

	//--------------js modules--------------
	// as es6 modules (import, expose)
	//
	modules: {
		//app.js
		app: 'src/main.js',

	},

	//------------templates.json------------
	// (put together with js modules under /src)
	templates: 'src/**/*.tpl.html',

	//-----------------style----------------
	css: 'styles/base.less', // into base.css

	//----------------assets----------------
	//'string' --> as glob, copy as is
	//{key: value} --> copy & re-dir
	//
	//overlapping folder will be merged.
	//
	assets: [
		//glob (copy/exclude as is)
		'assets/**/*',
		'!*.empty',
		//copy and re-dir (put in different folder) *NOT rename!*
		{
			'libs/bower_components/modernizr/modernizr.js':'js',
			'libs/bower_components/fontawesome/fonts/*':'fonts',
			'libs/bower_components/bootstrap/dist/fonts/*': 'fonts'
		},
	],

	//----------gulp plugin configs---------
	//
	plugins: {

		autoprefixer: {},
		'minify-css': {}, //clean-css
		
		babel: {}, //es6
		uglify: {},
		
		'minify-html': {
			empty: true,
			conditionals: true,
			spare: true
		},

		gzip: {}

	},
};