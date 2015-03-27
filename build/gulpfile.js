/**
 * Gulp build tasks.
 *
 * Tasks
 * -----
 * Required:
 * 
 * 1. css: LESS -> CSS -> /{output}/css/main.css (+prefix, +clean)
 * 2. tpl: Templates (html) -> wrap into {name: content} -> /{output}/templates.json
 * 3. module: JS -> babel (es6) -> [browserify (commonjs bundle)] -> /{output}/app.js
 * 4. libs: Vendor/Shared util JS -> concatenate -> {output}/libs.js
 * 5. assets: Assets/* -> copy into /{output}/*, copy and rename/merge certain file/folder
 * 6. compress: Minify and gzip the *.js and *.css in the output folder.
 *
 * Optional:
 * 
 * 7. watch: Watching changes in the /src folder and trigger certain task(s)
 * 8. clean: Clear the output folder.
 *
 * Configure
 * ---------
 * see ./config/<name>.js
 * 
 * Note
 * ----
 * 1. Javascripts will always be **linted** and css will always be **autoprefixed** and **cleaned**.
 * 2. To auto minify and gzip requires setting the production flag to true in configure.
 * 3. use `gulp --config [name] [task]` to load a different configure per task run.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 */

require('colors');
var path = require('path'),
gulp = require('gulp-help')(require('gulp')),
concat = require('gulp-concat'),
srcmaps = require('gulp-sourcemaps'),
size = require('gulp-size'),
rename = require('gulp-rename'),
gzip = require('gulp-gzip'),
uglify = require('gulp-uglify'),
mincss = require('gulp-minify-css'), //using clean-css internally
minhtml = require('gulp-minify-html'),
filter = require('gulp-filter'),
less = require('gulp-less'),
autoprefixer = require('gulp-autoprefixer'),
//plumber = require('gulp-plumber'),
del = require('del');

//---------------Configure--------------
//+ option to gulp cmd for loading different configures (trick using yargs).
var argv = require('yargs').option('C', {
	alias: 'config',
	describe: 'Specify a customized configure file to override base ones.',
	default: 'default'
}).argv;
// load the targeted configure.
var configure = require(path.join(__dirname, 'config', argv.C));
configure.root = configure.root || path.join(__dirname, '..');
console.log('Using configure:', argv.C.yellow);


//----------------Tasks-----------------
//default
gulp.task('default', false, function defaultTask(){
	console.log(configure);
});

//libs
gulp.task('libs', 'Concatenate js libraries', function libsTask(){
	//console.log(configure.libs);
	return gulp.src(configure.libs, {cwd: configure.root})
		.pipe(srcmaps.init())
		.pipe(size({showFiles: true}))
		.pipe(concat('libs.js', {newLine: ';'}))
		.pipe(srcmaps.write())
		.pipe(rename({dirname: 'js'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});

//module
gulp.task('module', 'Compile js modules through es6', function jsTask(){
	console.log(configure.modules);
});

//tpl
gulp.task('tpl', 'Combine HTML templates/components', function tplTask(){
	console.log(configure.templates);
});

//css
gulp.task('css', 'Compile css from LESS', function cssTask(){
	//console.log(configure.css);
	return gulp.src(configure.css, {cwd: configure.root})
		.pipe(less({
			paths: [configure.root, 
					path.join(configure.root, 'libs'), 
					path.join(configure.root, 'libs', 'bower_components')
					]

		}))
		.pipe(autoprefixer(configure.plugins.autoprefixer))
		.pipe(rename({dirname: 'css'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});

//assets
gulp.task('assets', 'Copy assets', function assetsTask(){
	console.log(configure.assets);
});

//compress
gulp.task('compress', 'Minify and Gzip the js/html/css files', function compressTask(){
	//console.log(configure.production);
	var filters = {
		js: filter('**/*.js'),
		css: filter('**/*.css'),
		html: filter('**/*.html')
	};
	return gulp.src(['**/*.js', '**/*.css', '**/*.html'], {cwd: path.join(configure.root, configure.output)})
		.pipe(filters.js)
		.pipe(uglify(configure.plugins.uglify))
		.pipe(filters.js.restore())

		.pipe(filters.css)
		.pipe(mincss(configure.plugins['minify-css']))
		.pipe(filters.css.restore())

		.pipe(filters.html)
		.pipe(minhtml(configure.plugins['minify-html']))
		.pipe(filters.html.restore())

		.pipe(rename({suffix: '.min'}))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}))
		.pipe(gzip(configure.plugins.gzip))
		.pipe(size({showFiles: true}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});

//clean
gulp.task('clean', 'Purge the output folder', function cleanTask(){
	return del('*', {cwd: path.join(configure.root, configure.output), force: true}, function(err, deletedFiles){
		console.log('Files deleted:', deletedFiles.length);
		console.log(deletedFiles.join(require('os').EOL));
	});
});