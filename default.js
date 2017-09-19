module.exports = {

	//---------------dist path--------------
	output: 'public',

	root: '/Users/cheriehuang/Desktop/test/',

	//------------js (modules/libs)---------
	// 'entrypoint' compile & bundle as es6 modules (import, expose. re-process during `watch`)
	// '[...]' as vanilla js concat (won't re-process during `watch`)
	javascript: {
		//app.js
		app: 'src/entrypoint.js',
		libs: [
		'bower_components/jquery/dist/jquery.js',
		'bower_components/underscore/underscore.js',
		'bower_components/bootstrap/dist/js/bootstrap.js'] //testing concatenation


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
    	fontDir: 'src/theme/font/',  //append ./ to this inside actual less file so it points to write location
    	fontFormats: ['woff2', 'woff', 'ttf'],
        spritePath: 'src/theme/img/sprite.png',
        fontName: 'CustomIconFont',
        cssPath: 'src/theme/icon.less' 
    },


  

	//-----------------style----------------
	// into app.css, (re-compile during `watch`)
	stylesheet: {
		entrypoint: 'src/theme/main.less',  //should this be an array? meaning multiple themes to process
        specifics: 'src/view/**/*.less' //need to append the specifics
	},
	

	//----------------assets----------------
	//'string' --> as glob, copy as is
	//{key: value} --> copy & re-dir
	//
	// overlapping folder will be merged.
	assets: [
		//glob (copy/exclude as is)
		'src/index.html',
		//copy and re-dir (put in different folder) *NOT rename!*
		{
			'src/theme/img/*' : 'img',
			'src/theme/font/*' : 'font'
		},
	],

	//----------gulp plugin configs---------
	//Don't change unless sure about...
	plugins: {

		autoprefixer: {},
		cleanCSS: {
			keepSpecialComments: '*' //special comment only (e.g license)
		}, //use clean-css internally 

		//this is not a gulp plugin so should this be here
		uglifyOptions: {
			 //by plugin default special comment only (e.g license) are kept
		},
		
		htmlMin: {
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
            	rules: [
                {
        		  	test: /\.js$/,
        		  	loader: 'babel-loader',
        		  	exclude: /node_modules/, //excludes transpiling these 3rd party libs
        		  	query:{ //could add plugins: ['transform-runtime'] to extract babel's runtime helpers
        		  		cacheDirectory: true,
        		  		presets: ['es2015'] //can add stage0, react, etc here as well
            	    }
                }]//end of rules
             }

         },

		gzip: {}

	},

	//------------watch params--------------
	//Don't change unless sure about...
	watchCSS: {
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
			css: 'src/**/*.less'
			//templates: as in config.templates
		}
	}
};
