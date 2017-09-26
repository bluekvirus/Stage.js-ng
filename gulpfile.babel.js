/**
 * Gulp build tasks. 
 *
 * Tasks
 * -----
 * Required Steps to take care of:
 * First load config file in using path, otherwise default path.
 * 1) Default: 'clean', 'js', 'tpl', 'css', 'assets' are called. Basically the build process task!
 * 2) Tpl: (optional) combine html templates inside templates.json file (default name) or some user specified json file name. 
 *    Wrap into {name:content} with name being path? or name of html file and content being the html tags
 *    Grab html from user defined src or default is the one in init folder structure.
 * 3) JS: 
 *    a) If (key,value) and value is string -> transpile/bundle es6 modules using this entry point into key target.
 *     OR
 *    b) If value is [] -> Concat/bundle non-es6 javascript into corresponding key targets.
 *    c) If user config wants lint than use jshint? jslint? -> default is not to lint (encourage users to use text editor linting)
 *    d) Concat/minify each file in value into key target file (for each target). 
 *    e) Uses webpack watch to watch the bundled files and monitor for changes before rebundling.
 * 4) less: 
 *    a) Possible inputs: specific theme name as 'string' or an [{name, src, target}] where each obj is a diff theme.
 *    b) Will end up with separate theme.css files in css output folder
 *    c) Make sure to always add component less files into each theme as well as include icon.less.
 * 5) icon:
 *    a) Generate fonts and sprite.png from /icon and corresponding icon.less file
 *    d) For png images might need to resize, through command line user 
 * 6) assets: 
 *    a) Default copies the /img folder and /font folder from src into the output folder. 
 *    b) Also copy index.html into output folder
 *    c) User can define what folders or files they want copied over or excluded
 * 7) clean: clear the output folder.
 * 8) watch:css
 *    a) watching changes in less files, and recompiling less into main.css for output folder.
 * 
 * (tasks using `return gulp.src()...` will be running in parallel)
 * -----------------------------------------------------------------------------
 * Configure
 * ---------
 * see default.js for default config options.
 * 
 * Note
 * ----
 * 1. Javascripts will NOT be **linted** but css will always be **autoprefixed** and **cleaned**.
 * 2. use `gulp --config [path] [task]` to load a different configure per task run. Otherwise searches in default user location for config file.
 * 3. Gulp is using node-glob internally, so all the options for gulp.src are in there.
 * 4. This gulp file requires babel preset es2015 as well as .babelrc config file. May also be put in package.json 
 * 
 * @author Cherie Huang
 * @created 2017.8.31
 */

import colors from 'colors';
import gulp from 'gulp';
import less from 'gulp-less';
import gutil from 'gulp-util';
import gsize from 'gulp-size';
import path from 'path';
import through2 from 'through2';
import _ from 'lodash';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import lazypipe from 'lazypipe';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import mergeStream from 'merge-stream'; 
import rename from 'gulp-rename';
import spritesmith from 'gulp.spritesmith';
import iconfont from 'gulp-iconfont';
import iconfontCss from 'gulp-iconfont-css';
import gulpfilter from 'gulp-filter';
import replace from 'gulp-replace';
import del from 'del';
import insert from 'gulp-insert';
import handlebars from 'handlebars';
import fs from 'fs';
import autoprefixer from 'less-plugin-autoprefix';
import webpackS from 'webpack-stream';
import webpack from 'webpack';
import deepmerge from 'deepmerge';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import chokidar from 'chokidar';
import shell from 'shelljs';
import forever from 'forever-monitor';
import runSequence from 'run-sequence';


var argv = require('yargs').options({
    'C': {
        alias: 'config',
        describe: 'Specify a customized configure file to override base ones.',
    },
    'root': {
        describe: 'Pass the cwd in case the default is not the correct path'
    }
}).argv;


//This chunk deals with all the configuration merging 
let configure;
try {
    var userconfig = require(argv.C);
    var defaultconfig = require('./default.js');
    configure = deepmerge(defaultconfig, userconfig, {arrayMerge: (dest, src, options) => {return src;}});
    configure.assets = _.concat(configure.assets, defaultconfig.assets);
    // do stuff
} catch (ex) {
    console.log('user config file not found, using default');
    configure = require('./default.js');
}
//configure root path through cli.js command line now, not config file
configure.root = argv.root;


//build command calls this default task
//runSequence is used to make sure webpack watch does not block gulp task execution
gulp.task('default', (cb) =>{
  runSequence('clean', 'less', 'assets', 'js');
});

gulp.task('js', () => {
     if(!configure.javascript) return; 
     var merged = mergeStream();
     _.forIn(configure.javascript, function(value,target){
        merged.add((_.isArray(value) ? 
                (gulp.src(value, {cwd: configure.root})
                     .pipe(gsize({title: `${target}.js:concat`, showFiles: true}))
                     .pipe(processJS.concat()))
        :
                (gulp.src(value, {cwd: configure.root})
                    .pipe(processJS.bundle()))
                    )
             .pipe(rename({basename: target, dirname: 'js'}))
             .pipe(gulp.dest(configure.output, {cwd: configure.root}))
        ); 
     }); 

     return merged.pipe(gsize({title: 'alljs', showFiles: true}));
});


const processJS = {
    bundle: lazypipe()
            .pipe(webpackS, configure.plugins.webpackStream),
    concat: lazypipe()
    //initialize a new gulp sourcemap. Will be a new property added to vinyl file objects
            .pipe(sourcemaps.init)
            .pipe(concat, 'tmp.js', {newLine: ';'})
            .pipe(sourcemaps.write) //does not actually write the sourcemap, just tells gulp to materialize them into a physical file when you call gulp.dest
          }

            





gulp.task('tpl', () => {
    if(!configure.templates) return;
    const outputFile = new gutil.File({ path: `${configure.templates.target}.json`}); 
    const tpls = {};
    return gulp.src(configure.templates.src, {cwd: configure.root})
           .pipe(gsize({title: 'tpl-process', showFiles: true })) 
           .pipe(through2.obj(function(htmlFile, enc, cb){
                if( htmlFile.isBuffer()){
                    //must be a buffer for most plugins to work b/c gulp can't handle stream of streams
                    gutil.log(`${htmlFile.relative} is being worked on`);
                    tpls[htmlFile.relative] = (String(htmlFile.contents));
                }
                cb(); //end of each file
            }, function(cb){
                outputFile.contents = new Buffer(JSON.stringify(tpls, null, 2));
                this.push(outputFile); //don't use arrow function here because we need 'this'
                cb(); //must call at end of this flush function
            }))
           .pipe(gsize({showFiles: true, title: 'tplfinal'})) 
           .pipe(gulp.dest(configure.output, {cwd: configure.root}));
}); 



//textures are currently not supported in icon task
gulp.task('icon', () => {
    if (!configure.icon) return; 
    const merged = mergeStream();
    const registry = [];
    var stream1 = gulp.src(`${configure.icon.src}/**/*.png`, {cwd: configure.root})
                      .pipe(spritesmith({
                         imgName: path.basename(configure.icon.spritePath),
                         cssName: path.basename(configure.icon.spritePath, '.png')  + path.extname(configure.icon.cssPath),
                         cssFormat: 'css',
                         imgPath: `${configure.root}${configure.icon.spritePath}` //used inside the css file
                  }));
                
    merged.add(stream1);
       const jsonf = gulpfilter('**/*.json', {restore: true});
       var stream2 = gulp.src(`${configure.icon.src}/**/*.png`, {cwd: configure.root})
                         .pipe(spritesmith({
                            imgName: path.basename(configure.icon.spritePath),
                            cssName: path.basename(configure.icon.spritePath, '.png') + '.json',
                            cssFormat: 'json_array' 
                         }))
                         .pipe(jsonf)
                         .pipe(gulp.dest(configure.icon.src, {cwd: configure.root})); //place json and demo within icon folder for now

    merged.add(stream2);
    var stream3 = gulp.src(`${configure.icon.src}/**/*.svg`, {cwd: configure.root})
                                .pipe(iconfontCss({
                                  fontName: configure.icon.fontName,
                                  path: 'css',
                                  targetPath: path.basename(configure.icon.cssPath),
                                  fontPath: `${configure.root}${configure.icon.fontDir}`
                                }))
                                .pipe(iconfont({
                                  fontName: configure.icon.fontName,
                                  normalize: true,
                                  prependUnicode: true,
                                  formats: configure.icon.fontFormats
                                }))
                                .on('glyphs', function(glyphs){
                                    function ensureDirectoryExistence(filePath) {
                                          var dirname = path.dirname(filePath);
                                          if (fs.existsSync(dirname)) {
                                            return true;
                                          }
                                          ensureDirectoryExistence(dirname);
                                          fs.mkdirSync(dirname);
                                        }
                                  //this function will create directories if they don't exist, otherwise writeFileSync will throw error
                        
                                    ensureDirectoryExistence(`${configure.root}/${configure.icon.src}/iconfonts.json`);
                                    fs.writeFileSync(`${configure.root}/${configure.icon.src}/iconfonts.json`,JSON.stringify(glyphs));
                                });
    merged.add(stream3);
   
   merged.on('end', () => {
       const outputFile = new gutil.File({ path: `demo.html`}); 
       const data = {
        sprite: require(`${configure.root}/${configure.icon.src}/sprite.json`),
        iconfonts: require(`${configure.root}/${configure.icon.src}/iconfonts.json`)
       };

        merged.add(gulp.src('./util/tpls/template.hbs.html')
                          .pipe(through2.obj(function(htmlFile, enc, cb){

                                 var demo = handlebars.compile(htmlFile.contents.toString())(data);
                            
                           
                            outputFile.contents =  new Buffer(demo);   
                            this.push(outputFile);
                             cb(); //end of each file
                           }))
                          .pipe(gsize({title: 'demo', showFiles: true}))
                          .pipe(replace("../icon.css", `../${path.basename(configure.icon.cssPath)}`))
                          .pipe(gulp.dest(configure.icon.src, {cwd: configure.root})));
    });

    //now filter and combine the less files
    const lessf = gulpfilter(['**/*.less', '**/*.sass', '**/*.css'], {restore: true});
    const spritef = gulpfilter('**/*.png', {restore: true});
    const fontsf =  gulpfilter(['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.eot', '**/*.svg'], {restore: true}); //all the possible output options of iconfont
    return merged.pipe(lessf)
          .pipe(concat(path.basename(configure.icon.cssPath)))
          .pipe(gulp.dest(path.dirname(configure.icon.cssPath), {cwd: configure.root}))
          .pipe(lessf.restore)
          .pipe(spritef)
          .pipe(gulp.dest(path.dirname(configure.icon.spritePath), {cwd: configure.root}))
          .pipe(spritef.restore)
          .pipe(fontsf)
          .pipe(gulp.dest(configure.icon.fontDir, {cwd: configure.root}));
});


gulp.task('less', cssFunc);
function cssFunc(){
    if(!configure.stylesheet) return;
    var autoprefix = new autoprefixer({browsers: ['last 2 version']});
    var merged = mergeStream();
    if(!_.isArray(configure.stylesheet.entrypoint)){
      configure.stylesheet.entrypoint = [configure.stylesheet.entrypoint];
    }
    _.forEach(configure.stylesheet.entrypoint, function(theme){
            merged.add( gulp.src(theme, {cwd: configure.root})
                            .pipe(insert.prepend('@import ' + `"${configure.icon.cssPath}"` + ';\n'))
                            .pipe(less({
                                   paths: [
                                            configure.root,
                                            path.join(configure.root, 'node_modules'),
                                            path.join(configure.root, 'bower_components')   //basefolder to search for imports from ex: @import bootstrap/bootstrap.js inside of less 
                                         ],
                                   plugins: [autoprefix, require('less-plugin-glob')]
                             }))
                           .pipe(replace(`${configure.root}${configure.icon.spritePath}`, '../img/'))
                           .pipe(replace(`${configure.root}${configure.icon.fontDir}`, '../font/'))
                           .pipe(gulp.dest(`${configure.output}/css`, {cwd: configure.root})));
    })//ends foreach
  return merged;
};


gulp.task('watch:css', () => {
    var cfg = configure.watchCSS;
    var cssTaskD = _.debounce(cssFunc, cfg.delay.factor.debounce * cfg.delay.unit);
     chokidar.watch(cfg.glob.css, {
        cwd: configure.root,
        usePolling: cfg.usePolling,
        interval: cfg.delay.factor.poll * cfg.delay.unit,
        binaryInterval: 3 * cfg.delay.factor.poll * cfg.delay.unit,
        disableGlobbing: false
     })
     .on('all', (e, path) => {
         console.log('css', e.yellow, path);
         cssTaskD(); 
     });

});



gulp.task('clean', () => {
    //del.sync() returns an array of deleted paths while del() returns a promise for an array of deleted paths.
    //force allows the deleting of current working directory and outside
    const deletedFiles = del.sync('*', {cwd: path.join(configure.root, configure.output), force: true});
    console.log('Number of files/folders deleted:', deletedFiles.length);

  if(deletedFiles.length) deletedFiles.push('');// add an empty line.
  console.log(deletedFiles.join(' [' + 'x'.red + ']' + require('os').EOL));

});

gulp.task('min', ['min:html', 'min:css', 'min:js']);

gulp.task('min:html', () => {
    return gulp.src(`${configure.output}/**/*.html`, {cwd: configure.root})
               .pipe(htmlmin({collapseWhitespace: true}))
               .pipe(rename({suffix: '.min'}))
               .pipe(gsize({title: 'minifyHTML', showFiles: true}))
               .pipe(gulp.dest(configure.output, {cwd: configure.root}));
});//index.html only probably


gulp.task('min:css', () => {
    return gulp.src(`${configure.output}/**/*.css`, {cwd: configure.root})
               .pipe(cleanCSS(configure.plugins.cleanCSS))
               .pipe(rename({suffix: '.min'}))
               .pipe(gsize({title: 'minifyCSS', showFiles: true}))
               .pipe(gulp.dest(configure.output, {cwd: configure.root}));
});

gulp.task('min:js', () => {
    return gulp.src(`${configure.output}/**/*.js`, {cwd: configure.root})
               .pipe(uglify())
               .pipe(rename({suffix: '.min'}))
               .pipe(gsize({title: 'minifyJS', showFiles: true}))
               .pipe(gulp.dest(configure.output, {cwd: configure.root}));
});

//assets is an array of strings and objects.
gulp.task('assets', () => {
  if(!configure.assets) return;
  const globCopy = [];
  const renameMap = {};
  _.each(configure.assets, (curr) => {
     if(_.isString(curr)) globCopy.push(curr);
     else _.extend(renameMap, curr);
  });
  const merged = mergeStream();
  var globStream = gulp.src(globCopy, {cwd: configure.root})
                       .pipe(gulp.dest(configure.output, {cwd: configure.root}))
  merged.add(globStream);
  _.forIn(renameMap, (newDir, srcPath) => {
      let renameStream = gulp.src(srcPath, {cwd: configure.root})
                             .pipe(rename((curr) => {
                                 if(_.endsWith(srcPath, '/**/*') || _.endsWith(srcPath, '/*')) curr.dirname = newDir; 
                                 else curr.dirname = path.join(newDir, curr.dirname); 
                             }))
                             .pipe(gulp.dest(configure.output, {cwd: configure.root}));
      merged.add(renameStream);
     });
  return merged.pipe(gsize({title: 'copied asset(s)', showFiles: true}));
  });


gulp.task('serve', () => {
    forever.start([path.join(configure.root, 'node_modules/.bin/http-server'), configure.output, '-p', argv.port || '5001', '-c-1'], {
        max: 1,
        cwd: configure.root
    });

    forever.start([path.join(configure.root, 'node_modules/.bin/gulp'), 'watch:css'], {
        max: 1
    });

    forever.start([path.join(configure.root, 'node_modules/.bin/gulp'), 'js'], {
        max: 1
    });

  });
 