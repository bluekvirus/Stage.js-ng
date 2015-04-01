/**
 * Gulp build tasks. 
 *
 * Tasks
 * -----
 * Required:
 * 
 * 1. css: LESS -> CSS -> /{output}/css/main.css (+prefix, +clean)
 * 2. tpl: templates (html) -> wrap into {name: content} -> /{output}/templates.json
 * 3. js: 
 * 		a. es6/commonjs -> [browserify (commonjs bundle + babelify)] -> /{output}/app.js
 * 		b. vendor/shared util JS -> concatenate -> {output}/libs.js
 * 4. assets: 
 * 		a. assets/* -> copy into /{output}/*
 * 		b. copy and re-dir/merge certain file/folder
 * 5. compress: minify and gzip the *.js and *.css in the output folder.
 * 6. clean: clear the output folder.
 *
 * Built-in:
 * 
 * 7. watch: watching changes and re-run js, css and tpl tasks.
 *
 * (tasks using `return gulp.src()...` will be running in parallel)
 *
 * Configure
 * ---------
 * see ./config/<name>.js
 * 
 * Note
 * ----
 * 1. Javascripts will always be **linted** and css will always be **autoprefixed** and **cleaned**.
 * 2. To auto minify and gzip requires setting the production flag to true in configure. (manual task: compress)
 * 3. use `gulp --config [name] [task]` to load a different configure per task run.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 */

require('colors');
var path = require('path'),
fs = require('fs'),
_ = require('lodash'),
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
replace = require('gulp-replace'),
less = require('gulp-less'),
autoprefixer = require('gulp-autoprefixer'),
through = require('through2'),
gutil = require('gulp-util'),
browserify = require('browserify'),
babel = require('babelify'),
//plumber = require('gulp-plumber'),
mergeStream = require('merge-stream'),
lazypipe = require('lazypipe'),
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
//=======
//default (without compress)
//=======
gulp.task('default', false, 
	_.compact(['clean', 'js', 'tpl', 'css', 'assets', configure.production?'compress':false])
);


//=======
//js (+jshint?)
//=======
var jspipe = {
	concat: lazypipe()
				.pipe(srcmaps.init).pipe(concat, 'tmp.js', {newLine: ';'})
				.pipe(srcmaps.write), //(+sourcemap, size x3+)
	bundle: lazypipe()
				.pipe(through.obj, function(file, encode, cb){
					//create browserify bundle stream
					browserify(file.path, _.extend({
						//insertGlobals : true, //(insert process, global, __filename, __dirname), gives size x10+!! thus skipped. 
						transform: babel.configure(configure.plugins.babel),
						debug: true, //(+sourcemap, size x3+)
					}, configure.plugins.browserify))
					//pass the entrypoint vinyl file down, with its content replaced by the bundle stream's
					.bundle(function(err, content){
						file.contents = content;
						cb(null, file);
					});
				})
};
gulp.task('js', 'Compile/Concat js modules(es6)/libs', function jsTask(){
	//console.log(configure.js);
	var merged = mergeStream();
	_.forIn(configure.js, function(v, k){
		//v --> entrypoint/array, k --> js target
		merged.add(
			(_.isArray(v)?
				gulp.src(v, {cwd: configure.root})
					//array: concat only
					.pipe(size({showFiles: true, title: k + '.js:concat'}))
					.pipe(jspipe.concat())
				:
				gulp.src(v, {cwd: configure.root})
					//entrypoint: turned into commonjs & bundled with require()
					.pipe(jspipe.bundle())
			)
			.pipe(rename({dirname: 'js', basename: k}))
			.pipe(gulp.dest(configure.output, {cwd:configure.root}))
		);
	});

	return merged.pipe(size({showFiles: true, title: 'js'}));
});


//===
//tpl (using through2 to transform/combine files in stream)
//===
gulp.task('tpl', 'Combine HTML templates/components', function tplTask(){
	//console.log(configure.templates);
	var tpls = {}; // --> JSON.stringify() upon 'finish'
	var file = new gutil.File({path: 'templates.json'});
	return gulp.src(configure.templates, {cwd: configure.root})
		.pipe(size({showFiles: true, title: 'tpl'}))
		.pipe(through.obj(function(file, encode, cb){
			//on 'file'
			//file is a vinyl File object (https://github.com/wearefractal/vinyl)
			if(file.isBuffer()){ //skipping isNull() & isStream()
				tpls[file.relative] = (String(file.contents)); //use as is
				//comments are preserved, no tag and attribute cleanup.
			}
			return cb(); //won't pass down the examined template file.
		}, function(cb){
			//on 'finish'
			file.contents = new Buffer(JSON.stringify(tpls, null, 2)); //utf-8
			this.push(file); //pass down the overall merged json file.
			cb();
		}))
		.pipe(size({showFiles: true, title: 'tpl'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});


//===
//css
//===
gulp.task('css', 'Compile css from LESS', function cssTask(){
	//console.log(configure.css);
	return gulp.src(configure.css, {cwd: configure.root})
		.pipe(less({
			paths: [
				configure.root, 
				path.join(configure.root, 'libs'), 
				path.join(configure.root, 'libs', 'bower_components')
			]

		}))
		.pipe(autoprefixer(configure.plugins.autoprefixer))
		.pipe(rename({dirname: 'css'}))
		.pipe(size({showFiles: true, title: 'css'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});


//======
//assets
//======
gulp.task('assets', 'Copy/Re-dir assets', function assetsTask(){
	//console.log(configure.assets);
	var glob = [], renameMap = {};
	_.each(configure.assets, function(a){
		if(_.isString(a)) glob.push(a);
		else _.extend(renameMap, a);
	});

	var merged = mergeStream(
		//glob (copy as is)
		gulp.src(glob, {cwd: configure.root})
			.pipe(gulp.dest(configure.output, {cwd: configure.root}))
	);

	_.forIn(renameMap, function(v, k){
		//copy (k = target file) & rename (v = new dir name)
		merged.add(gulp.src(k, {cwd: configure.root}).pipe(rename({dirname: v}))
			.pipe(gulp.dest(configure.output, {cwd: configure.root})));
	});

	return merged.pipe(size({showFiles: true, title: 'assets'}));
});


//========
//compress (+templates.json?)
//========
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
		.pipe(replace(/(\.css|\.js)/g, '.min$1')) //ref the minified version in minified html.
		.pipe(minhtml(configure.plugins['minify-html']))
		.pipe(filters.html.restore())

		.pipe(rename({suffix: '.min'}))
		.pipe(size({showFiles: true, title: 'compress:minify'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}))
		.pipe(gzip(configure.plugins.gzip))
		.pipe(size({showFiles: true, title: 'compress:gzip'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
});


//=====
//clean
//=====
gulp.task('clean', 'Purge the output folder', function cleanTask(){
	var deletedFiles = del.sync('*', {cwd: path.join(configure.root, configure.output), force: true});
	console.log('Files deleted:', deletedFiles.length);
	if(deletedFiles.length) deletedFiles.push('');// add an empty line.
	console.log(deletedFiles.join(' [' + 'x'.red + ']' + require('os').EOL));
});