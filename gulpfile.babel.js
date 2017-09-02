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


import gulp from 'gulp';
import sass from 'gulp-sass';
import less from 'gulp-less';
import lint from 'gulp-jslint';
import gutil from 'gulp-util';
import gsize from 'gulp-size';
import path from 'path';
import through2 from 'through2';


// load the targeted configure.
var configure = require(path.join(__dirname, 'config', '_base'));
configure.root = configure.root || __dirname;












// __dirname is always the directory in which the currently executing script resides.
gulp.task('default', () => console.log('Default task called'));


//default is just main.js as entry -> bundle.js assume is es6
gulp.task('js', () => {
     if(!configure.javascript) return; //nothing to do






});

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
