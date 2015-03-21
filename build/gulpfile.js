/**
 * Gulp build tasks.
 *
 * Tasks
 * -----
 * 1. css: LESS -> CSS -> /{dist}/css/main.css (+prefix, +clean)
 * 2. tpl: Templates (html) -> wrap into {name: content} -> /{dist}/templates.json
 * 3. js: JS -> [babel (es6)] -> [browserify (commonjs bundle)] -> /{dist}/app.js & vendor.js (+lint)
 * 4. assets: Assets/* -> copy into /{dist}/*, copy and rename/merge certain file/folder
 * 5. compress: minify and gzip the *.js and *.css in the output folder.
 * 6. watch: Watching changes in the /app folder and trigger certain task(s)
 *
 * Configure
 * ---------
 * see ./config/<name>.js
 * 
 * Note
 * ----
 * 1. Javascripts will always be **linted** and css will always be **autoprefixed** and **cleaned**.
 * 2. To minify and gzip requires setting the production flag to true in configure.
 * 3. use `gulp --config [name] [task]` to load a different configure per task run.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 */

require('colors');
var path = require('path'),
gulp = require('gulp-help')(require('gulp'));

//---------------Configure--------------
//+ option to gulp cmd for loading different configures (trick using yargs).
var argv = require('yargs').option('C', {
	alias: 'config',
	describe: 'Specify a customized configure file to override base ones.',
	default: 'default'
}).argv;
// load the targeted configure.
var configure = require('./config/' + argv.C);
console.log('Using configure:', argv.C.yellow);


//----------------Tasks-----------------
//default
gulp.task('default', false, function defaultTask(){
	console.log(configure);
});

//js
gulp.task('js', 'Bundle and combine the Javascripts', function jsTask(){
	console.log(configure.js);
});

//tpl
gulp.task('tpl', 'Combine HTML templates/components', function tplTask(){
	console.log(configure.templates);
});

//css
gulp.task('css', 'Compile css from LESS/SCSS', function cssTask(){
	console.log(configure.css);
});

//assets
gulp.task('assets', 'Copy assets', function assetsTask(){
	console.log(configure.assets);
});

//compress
gulp.task('compress', 'Minify and Gzip the js/html/css files', function compressTask(){
	console.log(configure.production);
});