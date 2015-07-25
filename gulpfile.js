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
 * 		c. amd/requirejs -> [TBI]
 * 4. assets: 
 * 		a. assets/* -> copy into /{output}/*
 * 		b. copy and re-dir/merge certain file/folder
 * 5. compress: minify and gzip the *.js and *.css in the output folder.
 * 6. clean: clear the output folder.
 * 7. watch: watching changes and re-run js, css and tpl tasks.
 * 8. amd: continue development after build, using requirejs. (--production to copy /src instead of symlink it)
 *
 * (tasks using `return gulp.src()...` will be running in parallel)
 *
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
plumber = require('gulp-plumber'),
mergeStream = require('merge-stream'),
lazypipe = require('lazypipe'),
chokidar = require('chokidar'),
gulpif = require('gulp-if'),
del = require('del');

//---------------Configure--------------
//+ option to gulp cmd for loading different configures (trick using yargs).
var argv = require('yargs').options({
	'C': {
		alias: 'config',
		describe: 'Specify a customized configure file to override base ones.',
		default: 'default'
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
var configure = require(path.join(__dirname, 'config', argv.C));
configure.root = configure.root || __dirname;
configure.production = argv.P;
configure.targets = _.reduce(_.compact(argv.T.split(',')), function(targets, t){
	targets[t] = true;
	return targets;
}, {});
configure.targets = _.size(configure.targets)? configure.targets : false;
console.log('Using configure:', argv.C.yellow);


//----------------Tasks-----------------
//=======
//default (without compress, amd)
//=======
gulp.task('default', false, 
	_.compact(['clean', 'js', 'tpl', 'css', 'assets'])
);


//=======
//js (+jshint?)
//=======
gulp.task('js', 'Compile/Concat js modules(es6)/libs', ['tpl'], jsTask);
function jsTask(cb, compileonly, subset){
	//console.log(configure.javascript);
	if(!configure.javascript) return;
	var merged = mergeStream();
	_.forIn(configure.javascript, function(v, k){
		//v --> entrypoint/array, k --> js target
		if(configure.targets && !configure.targets[k]) return;
		if(compileonly && _.isArray(v)) return;
		if(subset && !_.includes(subset, k)) return;
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
}
//reusable js piples (using lazypipe)
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


//===
//tpl (using through2 to transform/combine files in stream)
//===
gulp.task('tpl', 'Combine HTML templates/components', tplTask);
function tplTask(){
	//console.log(configure.templates);
	if(!configure.templates) return;
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
}


//===
//css
//===
gulp.task('css', 'Compile css from LESS', cssTask);
function cssTask(){
	//console.log(configure.stylesheet);
	if(!configure.stylesheet) return;
	return gulp.src(configure.stylesheet, {cwd: configure.root})
		.pipe(plumber())
		.pipe(less({
			paths: [
				configure.root, 
				path.join(configure.root, 'libs'), 
				path.join(configure.root, 'libs', 'bower_components'),
				path.join(configure.root, 'libs', 'vendor')
			]

		}))
		.pipe(autoprefixer(configure.plugins.autoprefixer))
		.pipe(rename({dirname: 'css', basename: 'app'}))
		.pipe(size({showFiles: true, title: 'css'}))
		.pipe(gulp.dest(configure.output, {cwd: configure.root}));
}


//======
//assets
//======
gulp.task('assets', 'Copy/Re-dir assets', assetsTask);
function assetsTask(){
	//console.log(configure.assets);
	if(!configure.assets) return;
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
		//copy (k = target file/folder) & rename (v = new dir name)
		var isFolder = _.endsWith(k, '/*') || _.endsWith(k, '/**/*');
		merged.add(gulp.src(k, {cwd: configure.root}).pipe(rename(function(p){
			//if k is file p.dirname = v, else p.dirname = path.join(v, p.dirname)
			if(isFolder)
				p.dirname = path.join(v, p.dirname);
			else
				p.dirname = v;
		})).pipe(gulp.dest(configure.output, {cwd: configure.root})));
	});

	return merged.pipe(size({showFiles: true, title: 'assets'}));
}


//========
//watch (using chokidar)
//========
gulp.task('watch', 'Watching changes to src/style/template and rebuild', function watchTask(){
	//shared configure
	var cfg = configure.watch;
	cfg._general = {
		cwd: configure.root,
		usePolling: cfg.usePolling,
		interval: cfg.delay.factor.poll * cfg.delay.unit,
		binaryInterval: 3 * cfg.delay.factor.poll * cfg.delay.unit //hidden factor = 3
	};

	//js
	if(configure.targets && configure.targets.js){
		var jsTaskD = _.debounce(jsTask, cfg.delay.factor.debounce * cfg.delay.unit);
		chokidar.watch(cfg.glob.js, cfg._general)
		.on('all', function(e, path){
			console.log('js', e.yellow, path);
			jsTaskD(_.noop, 'compileonly');
		});
	}

	//tpl
	if(configure.targets && configure.targets.tpl){
		var tplTaskD = _.debounce(tplTask, cfg.delay.factor.debounce * cfg.delay.unit);
		chokidar.watch(cfg.glob.tpl || configure.templates, cfg._general)
		.on('all', function(e, path){
			console.log('tpl', e.yellow, path);
			tplTaskD();
		});
	}

	//css
	if(configure.targets && configure.targets.css){
		var cssTaskD = _.debounce(cssTask, cfg.delay.factor.debounce * cfg.delay.unit);
		chokidar.watch(cfg.glob.css, cfg._general)
		.on('all', function(e, path){
			console.log('css', e.yellow, path);
			cssTaskD();
		});
	}
});


//========
//compress (+templates.json?)
//========
gulp.task('compress', 'Minify and Gzip the js/html/css files', function compressTask(){
	var filters = {
		js: filter('**/*.js'),
		css: filter('**/*.css'),
		html: filter('**/*.html')
	};
	return gulp.src(['**/*.js', '**/*.css', '**/*.html'], {cwd: path.join(configure.root, configure.output), follow: false})
		.pipe(filters.js)
		.pipe(uglify(configure.plugins.uglify))
		.pipe(filters.js.restore())

		.pipe(filters.css)
		.pipe(mincss(configure.plugins['minify-css']))
		.pipe(filters.css.restore())

		.pipe(filters.html)
		.pipe(gulpif(argv.keep, replace(/(\.css|\.js)/g, '.min$1'))) //ref the minified version in minified html.
		.pipe(minhtml(configure.plugins['minify-html']))
		.pipe(filters.html.restore())

		.pipe(gulpif(argv.keep, rename({suffix: '.min'})))
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


//=====
//amd (through requirejs)
//production: copy /src --> output/amd, require-text.js --> output/js/require-text.js
//development: link instead of copy.
//
//Note: you can't change the path to the src folder yet, this task will always try /src.
//=====
gulp.task('amd', 'Create links to /src and continue dev after build', ['js'], function amdTask(){

	//1. create link or copy of /src and require-text.js
	var amdFolderName = 'amd';
	if(!configure.production)
		_.each({
			'libs/vendor/requirejs/require-text.js': 'js/require-text.js',
			'src': amdFolderName
		}, function(link, src){
			var srcpath = path.join(configure.root, src),
			dstpath = path.join(configure.root, configure.output, path.dirname(link), path.basename(link));
			fs.symlink(srcpath, dstpath, fs.statSync(srcpath).isDirectory()?'dir':'file', function(){
				console.log('linked'.yellow, srcpath.replace(configure.root, ''), '-->'.grey, dstpath.replace(configure.root, ''));
			});
			
		});
	else {
		//remove the symlinks first just in case.
		del.sync(['js/require-text.js', amdFolderName], {cwd: path.join(configure.root, configure.output), force: true});
		configure.assets = [
			{
				'libs/vendor/requirejs/require-text.js': 'js',
				'src/**/*': amdFolderName
			}
		];
		assetsTask();
	}

	//2. change app.js targets to amd wrapper and recompile
	var amdTarget = 'app'; //!!HARDCODE!!
	if(configure.javascript[amdTarget]){ 
		configure.javascript[amdTarget] = [
			'libs/vendor/requirejs/require.js',
			'libs/vendor/stagejsv2/amd-require.js'
		];
		jsTask(_.noop, false, [amdTarget]);
	}

	//3. clear templates.json
	configure.templates = [];
	tplTask();

});