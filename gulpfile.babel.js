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


gulp.task('default', () => console.log('Default task called'));

gulp.task('tpl', () => {
    //if the user does not want to combine templates than we end this task
    if(!configure.templates) return;
    //default if user does not specify output file name. Will be put in current output directory dist or whatever
    var outputFile = new gutil.File({ path: '${configure.templates.target}.json'}); 
    return gulp.src(configure.templates, {cwd: configure.root})
           .pipe(gsize({title: 'tpl-process', showFiles: true })) //just for logging purposes of size of each file in tpl-process
           .pipe(through2.obj((htmlFile, enc, cb) => {
                //double check if this is necessary or still is a bug??
                if( htmlFile.isBuffer()){
                    //save this current htmlfile path and its contents into template object
        
                }
	        
    


});
