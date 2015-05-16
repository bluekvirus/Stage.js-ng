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
 * 	  	settings for some gulp plugins.
 * 2. control aspects: 
 * 		dist path,
 * 		compress[minify, gzip],
 * 		js[es6, concat],
 * 		css,
 * 		template, 
 * 		assets (copy, re-dirname),
 * 		watch
 * 		
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
 * 2. Concatenated lib/vendor .js files can be used directly using their globally exposed vars.
 * 3. We embed sourcemaps inside compiled/concatenated js targets, thus resulting x3 file size.
 * 4. Minified js, css and html will not contain sourcemaps and comments (except for special / *!..* /)
 * 5. Watch task only recompile js, less and tpl.html files, skipping concatenated js targets.
 *
 * Important Note
 * --------------
 * We use babel for es6 -> commonjs and browserfiy for commonjs -> browser. Thus the package.json file in this build 
 * folder could contain npm modules in the `dependencies` block and gets bundled by browserify. Although we do NOT encourage
 * bundling browser side libraries this way, the `dependencies` block is left clean open and up to you. 
 * 
 * We highly recommend using the `gulp libs` task and bower package manager for browser side library management. 
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 *
 */

module.exports = {

	//---------------dist path--------------
	output: 'public',

	//-----------minified & gzipped---------
	// with .min.html auto ref-ing .min.js/css
	production: false,

	//------------js (modules/libs)---------
	// 'entrypoint' compile & bundle as es6 modules (import, expose. re-process during `watch`)
	// '[...]' as vanilla js concat (won't re-process during `watch`)
	javascript: {
		//app.js
		app: 'src/entrypoint.js',

		//amd during dev? (applied automatically with task:dance)
		// app: [
		// 	'libs/vendor/requirejs/require.js',
		// 	'libs/vendor/requirejs/config.js'
		// ],

		//libs.js
		libs: [
			'libs/bower_components/jquery/dist/jquery.js',
			'libs/vendor/jquery-ui/position.js',
			'libs/bower_components/lodash/lodash.js',
			'libs/bower_components/eventemitter2/lib/eventemitter2.js',
			'libs/bower_components/director/build/director.js',
			'libs/bower_components/i18next/i18next.js',
			//-----------------------------------------
			'libs/vendor/stagejsv2/infrastructure.js',
			'libs/vendor/stagejsv2/coop-ee2.js',
			'libs/vendor/stagejsv2/utils.js',
			'libs/vendor/stagejsv2/com-ajax-ws-rtc.js',
			'libs/vendor/stagejsv2/i18n-i18next.js',
			'libs/vendor/stagejsv2/navigation-director.js',
			//-----------------------------------------
			'libs/bower_components/bootstrap/dist/js/bootstrap.js',
			'libs/bower_components/bootstrap-material-design/dist/js/material.js',
			'libs/bower_components/bootstrap-material-design/dist/js/ripples.js',
		],
	},

	//------------templates.json------------
	// put together with js modules under /src (re-combine during `watch`)
	templates: ['src/**/*.html'],

	//-----------------style----------------
	// into base.css, (re-compile during `watch`)
	stylesheet: 'styles/base.less', 

	//----------------assets----------------
	//'string' --> as glob, copy as is
	//{key: value} --> copy & re-dir
	//
	// overlapping folder will be merged.
	assets: [
		//glob (copy/exclude as is)
		'assets/**/*',
		'!*.empty',
		//copy and re-dir (put in different folder) *NOT rename!*
		{
			'libs/bower_components/modernizr/modernizr.js':'js',
			'libs/bower_components/fontawesome/fonts/*':'fonts',
			'libs/bower_components/bootstrap/dist/fonts/*': 'fonts',
			'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
		},
	],

	//---------------symlinks---------------
	//create symbolic links to output folder (non-production mode)
	//names will be prefixed by _shadow_ (e.g dir/_shadow_basename)
	//Don't change unless sure about...
	shadows: {
		'libs/vendor/requirejs/require-text.js': 'js/require-text.js',
		'src': 'src'
	},

	//----------gulp plugin configs---------
	//Don't change unless sure about...
	plugins: {

		autoprefixer: {},
		'minify-css': {
			keepSpecialComments: '*' //special comment only (e.g license)
		}, //use clean-css internally
		
		babel: {}, //es6 -> commonjs
		browserify: {}, //commonjs -> browser
		uglify: {
			preserveComments: 'some' //special comment only (e.g license)
		},
		
		'minify-html': {
			empty: true,
			conditionals: true, //remove comments but not the ie ones.
			spare: true
		},

		gzip: {}

	},

	//------------watch params--------------
	//Don't change unless sure about...
	watch: {
		usePolling: true,
		delay: {
			unit: 300, // ms
			factor: { // unit * factor
				poll: 1,
				debounce: 2
			}
		},
		//watch globs (different than the corresponding tasks' globs)
		glob: {
			js: 'src/**/*.js',
			css: 'styles/**/*.less',
		}
	}
};