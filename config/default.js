module.exports = {

	//---------------dist path--------------
	output: 'public',

	//------------js (modules/libs)---------
	// 'entrypoint' compile & bundle as es6 modules (import, expose. re-process during `watch`)
	// '[...]' as vanilla js concat (won't re-process during `watch`)
	javascript: {
		//app.js
		app: 'src/entrypoint.js',
	},

	//------------templates.json------------
	// recombine during watch
	templates: {
	    src: ['src/**/*.html'],
		target: "alltemplates" //or all.json
                    
    },

        //----------------icon process -------------
    // generate iconfonts, generate sprite, and prepare combined css file for icon
    icon:{
    	src: 'src/theme/icon',
    	imgDir: 'src/theme/img/', //for output directory based off of baseFolder as well
    	fontsDir: 'src/theme/font/',  //append ./ to this inside actual less file so it points to write location
    	cssFormat: 'css', //or less or sass 
    	fontFormats: ['woff2', 'woff', 'ttf'],
        spriteName: 'src/theme/sprite.png',
        fontName: 'CustomIconFont',
        cssName: 'src/theme/icon.css' 
    },


  

	//-----------------style----------------
	// into app.css, (re-compile during `watch`)
	stylesheet: 'src/theme/main.less',  //should this be an array? meaning multiple themes to process

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
			'libs/bower_components/bootstrap/fonts/*' : 'fonts',
            'libs/bower_components/font-awesome/fonts/*' : 'fonts',
            //copes over all subfolders in fonts and all of their font files. if do /* or /**/* means its a file
            'libs/bower_components/roboto-fontface/fonts/**' : 'fonts',
		},
	],

	//----------gulp plugin configs---------
	//Don't change unless sure about...
	plugins: {

		autoprefixer: {},
		'minify-css': {
			keepSpecialComments: '*' //special comment only (e.g license)
		}, //use clean-css internally 

		//this is not a gulp plugin so should this be here
		uglifyOptions: {
			 //by plugin default special comment only (e.g license) are kept
		},
		
		'minify-html': {
			empty: true,
			conditionals: true, //remove comments but not the ie ones.
			spare: true
		},

		webpackStream: {
            cache: true,
            watch: true,
            watchOptions:{
               poll: true, //can specify a poll interval in milliseconds as well
               aggregateTimeout: 300, //adds a 300 ms delay before rebuilding once the first file changes
               //allows aggregation of other changes during this time period into one rebuilt
            },
            module:{
            	loaders: [
            	{
            		test: /\.js$/,
            		loader: 'import-glob'
            	},
                {
        		  	test: /\.js$/,
        		  	loader: 'babel-loader',
        		  	exclude: /node_modules/, //excludes transpiling these 3rd party libs
        		  	query:{ //could add plugins: ['transform-runtime'] to extract babel's runtime helpers
        		  		cacheDirectory: true,
        		  		//presets: ['es2015'] //can add stage0, react, etc here as well
            	}
            		  }]
            	}

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
			//templates: as in config.templates
		}
	}
};
