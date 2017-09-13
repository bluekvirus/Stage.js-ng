/**
 * Gulp build tasks. 
 *
 * Tasks
 * -----
 * Required Steps to take care of:
 * First load config file in.
 * 1) Default: 'clean', 'js', 'tpl', 'css', 'assets' are called
 * 2) Tpl: (optional) combine html templates inside templates.json file (default name) or some user specified json file name. 
 *    Wrap into {name:content} with name being path? or name of html file and content being the html tags
 *    Grab html from user defined src or default is the one in init folder structure.
 * 3) JS: 
 *    a) If (key,value) and value is string -> transpile/bundle es6 modules using this entry point into key target.
 *     OR
 *    b) If value is [] -> Concat/bundle non-es6 javascript into corresponding key targets.
 *    c) If user config wants lint than use jshint? jslint? -> default is not to lint (encourage users to use text editor linting)
 *    d) Concat/minify each file in value into key target file (for each target). (default is to do both, could have option to not minify) 
 *    e) FIGURE OUT PATH COLON THING
 *    f) TODO: need a default output file based on init command for stagejs (do we need to handle amd/requirejs?)
 * 4) CSS: 
 *    a) Possible inputs: specific theme name as 'string' or an [{name, src, target}] where each obj is a diff theme.
 *    b) Will end up with  separate theme.css files in css output folder
 *    c) Make sure to always add component less files into each theme as well as include icons.less and textures.less which
 *       we generate by converting icons folder and textures folder into .less files then import into theme.less. 
 *    d) Account for how new icons, fonts, textures are added into folders and build. Node sprite generator, web fonts generator, later must resize png by prompting user
 * 5) Assets: Don't forget to copy fonts in b/c can't do with .less (unless is a web font which is in icons)
 * 		a. assets/* -> copy into /{output}/*
 * 		b. copy and re-dir/merge certain file/folder
 * 6. clean: clear the output folder.
 * 7. watch: watching changes and re-run js, css and tpl tasks.
 * 
 * (tasks using `return gulp.src()...` will be running in parallel)
 * -----------------------------------------------------------------------------
 * Theme Assets Preparation Process:
 * 1. Gather font files from bower_components into [theme]/fonts? using assets?
 * 2. Process logos, icons, pics and merge them into [theme]/img/sprite.png and [theme]/img/img.less
 * 3. Process texture into [theme]/img/img.less as well b/c can't put inside sprite.png
 * 4. Build *.less into corresponding [theme].css file (always append all component less files in "src/ ** / *.less"
 * -----------------------------------------------------------------------------
 * Configure
 * ---------
 * see ./config/<name>.js
 * 
 * Note
 * ----
 * 1. Javascripts will NOT be **linted** but css will always be **autoprefixed** and **cleaned**.
 * 2. use `gulp --config [name] [task]` to load a different configure per task run.
 * 3. Normal build sequence `gulp -C <config>` --> [`gulp -C <config> amd`] --> `gulp -C <config> compress`
 * 4. task:compress will not follow symbolic links.
 * 5. Gulp is using node-glob internally, so all the options for gulp.src are in there.
 * 
 * 
 * @author Cherie Huang
 * @created 2017.8.31
 */

import colors from 'colors';
import gulp from 'gulp';
import sass from 'gulp-sass';
import less from 'gulp-less';
import jslint from 'gulp-jslint';
import gutil from 'gulp-util';
import gsize from 'gulp-size';
import path from 'path';
import through2 from 'through2';
import _ from 'lodash';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import lazypipe from 'lazypipe';
import concat from 'gulp-concat'
import sourcemaps from 'gulp-sourcemaps'
import mergeStream from 'merge-stream' //more popular than gulp-merge or merge2
import rename from 'gulp-rename'
import spritesmith from 'gulp.spritesmith'
import iconfont from 'gulp-iconfont'
import iconfontCss from 'gulp-iconfont-css'
import gulpfilter from 'gulp-filter'
import replace from 'gulp-replace'
import runSequence from 'run-sequence'
import del from 'del'
import lessImport from 'gulp-less-import'
import hb from 'gulp-hb'
import insert from 'gulp-insert'
import handlebars from 'handlebars'
import fs from 'fs'
import autoprefixer from 'less-plugin-autoprefix'
import webpackS from 'webpack-stream'
import webpack from 'webpack'



//configure commandline options, grabbed from the original stagesnextgen
var argv = require('yargs').options({
    'C': {
        alias: 'config',
        describe: 'Specify a customized configure file to override base ones.',
        default: '_base'
    },
    'P': {
        alias: 'production',
        describe: 'Further controls behavior of the amd task.',
        default: false
    },
    'K': {
        alias: 'keep',
        describe: 'Whether to keep original .js/css/html files during compress.',
        default: false
    },
    'T': {
        alias: 'target',
        describe: 'Filter targets in task:js and task:watch',
        default: '' //',' (comma) separated list
    }
}).argv;

if(argv.h || argv.help) {
    console.log('Use', 'gulp help'.yellow, 'instead...');
    //require('child_process').spawnSync('gulp', ['help'], {stdio: 'inherit'}); v0.12.x
    process.exit();
}
// load the targeted configure.
//import configure from `${__dirname}/config/${argv.C}`
const configure = require(path.join(__dirname, 'config', argv.C));
configure.root = configure.root || __dirname;
//process the possible javascript targets passed through command line. If none then configure.targets = false. otherwise an object
configure.targets = _.reduce(_.compact(argv.T.split(',')), function(targets, t){
    targets[t] = true;
    return targets;
}, {});
configure.targets = _.isEmpty(configure.targets) ? false : configure.targets;
console.log('Using configure:', argv.C.yellow);











// __dirname is always the directory in which the currently executing script resides.
gulp.task('default', () => console.log('Default task called'));

//making reusable pipeline for bundling, transpiling, minifying js

//SWITCH TO WEBPACK
/*const processJS = {
    bundle: lazypipe()
            .pipe(function () {
                //lazypipe calls the function and passes in no args. It instantiates a new gulp-if pipe and returns it to lazypipe
               return gulpif(configure.javascript.lint,  jslint());
            })
             //remember that you might need vinyl-transform to transform standard text transform streams from npm into a vinyl pipeline like gulp.
             //can't do this anymore cause browserify now returns a readable stream but vinyl transform expects a duplex stream.
            .pipe(through2,(jsFile, enc, cb) => {
                browserify(jsFile.path, _.extend({debug: true}, configure.plugins.browserify))
                .transform("babelify", _.extend({presets: ["es2015"]},configure.plugins.babel)) //gives presets" ["es2015"]
                .bundle((err, results) => {
                    jsFile.contents = results;
                    cb(null, jsFile); //results placed into entrypoint file and returned. Wraps with vinyl file
                });
            })
            .pipe(function() {
                return gulpif(configure.javascript.minify, uglify(configure.plugins.uglify));
            }),
    concat: lazypipe()
    //initialize a new gulp sourcemap. Will be a new property added to vinyl file objects
            .pipe(sourcemaps.init)
            .pipe(concat, 'tmp.js', {newLine: ';'})
            .pipe(sourcemaps.write) //does not actually write the sourcemap, just tells gulp to materialize them into a physical file when you call gulp.dest

            

}*/

//default is just main.js as entry -> bundle.js assume is es6
/*gulp.task('js', ['tpl'], () => {
     if(!configure.javascript) return; //nothing to do not in the config
     if(_.isEmpty(configure.javascript)) // user wants the default behavior empty js config object. using lodash function isEmpty()
     {
        return gulp.src('main.js', {cwd: configure.root})
            //our default behavior with main.js
            //don/t need to print size because only one entry point file
            .pipe(processJS.bundle())
            .pipe(rename({dirname: 'js', basename: 'app'}))
            .pipe(gulp.dest(configure.output, {cwd: configure.root})); //places app.js into the outfile folder    
     }//end of default behavior
     //other case involves possible mix of es6 modules or a bunch of targets with different possible sources.
     var merged = mergeStream();
     _.forIn(configure.javascript, function(value,target){
        //v is the string/array of paths. k is the javascript target file
        //if the target object exists and is not false. But this current target is filtered out just return to move on to next target
        if(configure.targets && !configure.targets[target]) return;
        //should we have a compile only option??
        //if(configure.compileonly && _.isArray(value)) return; //should compile only meaning only do the non array values
        merged.add((_.isArray(value) ? 
                (gulp.src(value, {cwd: configure.root})
                     .pipe(gsize({title: `${target}.js:concat`, showFiles: true}))
                     .pipe(processJS.concat()))
        :
                (gulp.src(value, {cwd: configure.root})
                    .pipe(processJS.bundle()))
                    )//ends ternary
             .pipe(rename({basename: target, dirname: 'js'})) //everything js related is placed in js folder in output folder.]
             .pipe(gulp.dest(configure.output, {cwd: configure.root}))
        ); //ends merge.add
     }); //ends forIn loop

     return merged.pipe(gsize({title: 'alljs', showFiles: true}));
});*/

//default is just main.js as entry -> bundle.js assume is es6
gulp.task('js', ['tpl'], () => {
     if(!configure.javascript) return; //nothing to do not in the config
     //other case involves possible mix of es6 modules or a bunch of targets with different possible sources.
     var merged = mergeStream();
     //configure.javascript default behavior set in config due to merge already
     _.forIn(configure.javascript, function(value,target){
        //v is the string/array of paths. k is the javascript target file
        //if the target object exists and is not false. But this current target is filtered out just return to move on to next target
        if(configure.targets && !configure.targets[target]) return;
        //should we have a compile only option??
        //if(configure.compileonly && _.isArray(value)) return; //should compile only meaning only do the non array values
        merged.add((_.isArray(value) ? 
                (gulp.src(value, {cwd: configure.root})
                     .pipe(gsize({title: `${target}.js:concat`, showFiles: true}))
                     .pipe(processJS.concat()))
        :
                (gulp.src(value, {cwd: configure.root})
                    .pipe(processJS.bundle()))
                    )//ends ternary
             .pipe(rename({basename: target, dirname: 'js'})) //everything js related is placed in js folder in output folder.]
             .pipe(gulp.dest(configure.output, {cwd: configure.root}))
        ); //ends merge.add
     }); //ends forIn loop

     return merged.pipe(gsize({title: 'alljs', showFiles: true}));
});


//SWITCH TO WEBPACK
const processJS = {
    bundle: lazypipe()
            .pipe(function () {
                //lazypipe calls the function and passes in no args. It instantiates a new gulp-if pipe and returns it to lazypipe
               return gulpif(configure.javascript.lint,  jslint());
            })
            .pipe(webpackS,{
            	cache: true,
            	module:{
            		loaders: [
            		  {
            		  	test: /\.js$/,
            		  	loader: 'babel-loader',
            		  	exclude: /node_modules/, //excludes transpiling these 3rd party libs
            		  	query:{ //could add plugins: ['transform-runtime'] to extract babel's runtime helpers
            		  		cacheDirectory: true,
            		  		presets: ['es2015'] //can add stage0, react, etc here as well
            		  	}
            		  }
            		]
            	},
            	plugins:[
            	    new webpack.optimize.UglifyJsPlugin()
            	]

            }),
    concat: lazypipe()
    //initialize a new gulp sourcemap. Will be a new property added to vinyl file objects
            .pipe(sourcemaps.init)
            .pipe(concat, 'tmp.js', {newLine: ';'})
            .pipe(sourcemaps.write) //does not actually write the sourcemap, just tells gulp to materialize them into a physical file when you call gulp.dest
          }

            





gulp.task('tpl', () => {
    //if the user does not want to combine templates than we end this task
    if(!configure.templates) return;
    //default if user does not specify output file name. Will be put in current output directory dist or whatever
    const outputFile = new gutil.File({ path: `${configure.templates.target}.json`}); 
    const tpls = {};
    return gulp.src(configure.templates.src, {cwd: configure.root})
           .pipe(gsize({title: 'tpl-process', showFiles: true })) //just for logging purposes of size of each file in tpl-process
           .pipe(through2.obj(function(htmlFile, enc, cb){
                if( htmlFile.isBuffer()){
                    //must be a buffer for most plugins to work b/c gulp can't handle stream of streams
                    gutil.log(`${htmlFile.relative} is being worked on`);
                    tpls[htmlFile.relative] = (String(htmlFile.contents));
                }
                cb(); //end of each file
            }, function(cb){
                outputFile.contents = new Buffer(JSON.stringify(tpls, null, 2));
                this.push(outputFile); //don't use arrow function here because we need this
                cb(); //must call at end of this flush function
            }))
           .pipe(gsize({showFiles: true, title: 'tplfinal'})) //could minify templates.json later if needed and remove whitespace if user wants
           .pipe(gulp.dest(configure.output, {cwd: configure.root}));
}); //end of tpl task



//textures will be ignored
gulp.task('icon', () => {
    if ((!configure.sprite) && (!configure.iconfont)) return; 
    var merged = mergeStream();
    const registry = [];
    configure.iconPath = configure.iconPath || 'src/theme/'; //configure.iconPath is the base output path used for sprites and icon fonts. Configs should be in reference to this.
    if(configure.sprite)
    {
      //imgPath is the path we want to use inside img.less file to reference sprite.png, in context of where the img.less file is located.
       configure.sprite =  _.extend({src: 'src/theme/icon/**/*.png', targetName: 'sprite', imgPath: './img/',outputPath: 'img/', format: 'css'},configure.sprite);
       var stream1 = gulp.src(configure.sprite.src, {cwd: configure.root})
                      .pipe(spritesmith({
                         imgName: `${configure.sprite.targetName}.png`,
                         cssName: `${configure.sprite.targetName}.${configure.sprite.format}`,
                         imgPath: `${configure.sprite.imgPath}${configure.sprite.targetName}.png`
                  }));
                     // .pipe(gulp.dest(configure.sprite.outputPath, {cwd: configure.root}));  //need to combine the less files inside the stream somehow
       merged.add(stream1);
       const jsonf = gulpfilter('**/*.json', {restore: true});
       var stream2 = gulp.src(configure.sprite.src, {cwd: configure.root})
                         .pipe(spritesmith({
                            imgName: `${configure.sprite.targetName}.png`,
                            cssName: `${configure.sprite.targetName}.json`,
                            cssFormat: 'json_array' 
                         }))
                         .pipe(jsonf)
                         .pipe(gulp.dest(`${configure.iconPath}`, {cwd: configure.root}));

       merged.add(stream2);
       //have to do the json separately
    }

     if (configure.iconfont)
   {
     configure.iconfont = _.extend({fontName: 'CustomIconFont', normalize: true, prependUnicode: true, 
                           formats: ['woff2', 'woff', 'ttf'], src: 'src/theme/icon/**/*.svg', 
                           fontPath: 'font/', htmlPath: 'sample.html', cssPath: 'icon.less', 
                           cssFormat: 'css' }, configure.iconfont); //end extend
     var stream3= gulp.src(configure.iconfont.src, {cwd: configure.root})
  
                                .pipe(iconfontCss({
                                  fontName: configure.iconfont.fontName,
                                  path: configure.iconfont.cssFormat,
                                  targetPath: configure.iconfont.cssPath,
                                  fontPath: `./${configure.iconfont.fontPath}`
                                }))
                                .pipe(iconfont({
                                  fontName: configure.iconfont.fontName,
                                  normalize: configure.iconfont.normalize,
                                  prependUnicode: configure.iconfont.prependUnicode,
                                  formats: configure.iconfont.formats, 
                                }))
                                .on('glyphs', function(glyphs){
                                    fs.writeFileSync('src/theme/iconfonts.json',JSON.stringify(glyphs));
                                });
      merged.add(stream3);
   }

   merged.on('end', () => {
       const data = {
       	sprite: require('./src/theme/sprite.json'),
       	iconfonts: require('./src/theme/iconfonts.json')
       }
       fs.writeFileSync('./src/theme/demo.html', handlebars.compile(fs.readFileSync('./tpls/template.hbs.html', 'utf-8'))(data));
  
   });
    //this stream deals with the sprite.png file/ sprite.less
  

    //now filter and combine the less files
    const lessf = gulpfilter(['**/*.less', '**/*.sass', '**/*.css'], {restore: true});
    const spritef = gulpfilter('**/*.png', {restore: true});
    const fontsf =  gulpfilter(['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.eot', '**/*.svg'], {restore: true}); //all the possible output options of iconfont
    return merged.pipe(lessf)
          .pipe(concat(configure.iconfont.cssPath))
          .pipe(gulp.dest(configure.iconPath, {cwd: configure.root}))
          .pipe(lessf.restore)
          .pipe(spritef)
          .pipe(gulp.dest(`${configure.iconPath}${configure.sprite.outputPath}`, {cwd: configure.root}))
          .pipe(spritef.restore)
          .pipe(fontsf)
          .pipe(gulp.dest(`${configure.iconPath}${configure.iconfont.fontPath}`, {cwd: configure.root}))
});


gulp.task('less', () => {
    //configure.stylesheet is main.less or some .less file that is this themes css entrypoint
    if(!configure.stylesheet) return; //basically if they set configure.stylesheet as false than we skip it, otherwise we look within the merged config and go to default if not overridden
    var autoprefix = new autoprefixer({browsers: ['last 2 versions']});
    gulp.src('src/view/main.less')
         .pipe(insert.wrap('@import "src/theme/icon.less";\n', '@import "src/view/**/*.less";'))
         .pipe(less({
         	   paths: [
         	      configure.root,
         	      path.join(configure.root, 'node_modules'),
         	      path.join(configure.root, 'bower_components')   //basefolder to search for imports from ex: @import bootstrap/bootstrap.js inside of less 
         	   ],
         	   plugins: [autoprefix, require('less-plugin-glob')]
         }))
         .pipe(gulp.dest('public/'));
        //.pipe(insert.append('@import "vars/**/*.less'))

});


gulp.task('clean', () => {
    //del.sync() returns an array of deleted paths while del() returns a promise for an array of deleted paths.
    //force allows the deleting of current working directory and outside
    var deletedFiles = del.sync('*', {cwd: path.join(configure.root, configure.output), force: true});
    console.log('Number of files deleted:', deletedFiles.length);
    //formatting
	  if(deletedFiles.length) deletedFiles.push('');// add an empty line.
	  console.log(deletedFiles.join(' [' + 'x'.red + ']' + require('os').EOL));

});

gulp.task('assets', () => {
	if(!configure.assets) return;
	
})

/*gulp.task('sass', () => {
	if(!configure.stylesheet) return;
	gulp.src('src/view/main.sass')*/
	  //  .pipe(insert.wrap('@import "src/theme/icon.sass"\n', '@import "src/view/**/*.sass";'))
//})


//===
//tpl (using through2 to transform/combine files in stream)
//===
/*gulp.task('tpl', 'Combine HTML templates/components', tplTask);
function tplTask(){
    //console.log(configure.templates);
    if(!configure.templates) return;
    var tpls = {}; // --> JSON.stringify() upon 'finish'
    var file = new gutil.File({path: 'templates.json'});
    return gulp.src(configure.templates, {cwd: configure.root})

        .pipe(size({showFiles: true, showTotal: false, title: 'tpl'}))
        .pipe(through.obj(function(file, encode, cb){
             gutil.log('files');
            //on 'file'
            //file is a vinyl File object (https://github.com/wearefractal/vinyl)
            if(file.isBuffer()){ //skipping isNull() & isStream()
                tpls[file.relative] = (String(file.contents)); //use as is
                //comments are preserved, no tag and attribute cleanup.
            }
            gutil.log('about to call the callback');
            this.push(file); //here without flush func. would cause files to just be pushed along. Still two separate html files at end.
// with the flush function the result will be the two html files plus the completed template.json file
            cb();     //won't pass down the examined template file.
        }, function(cb){ //this is technically the flush function
            //on 'finish'
            gutil.log('Inside of the callback');
            gutil.log(file.contents);
            file.contents = new Buffer(JSON.stringify(tpls, null, 2)); //utf-8
            this.push(file); //pass down the overall merged json file.
            cb();
        }))
        .pipe(size({showFiles: true, title: 'tplfinal'}))
        .pipe(gulp.dest(configure.output, {cwd: configure.root}));
}*/
