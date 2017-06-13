# Stage.js Next Generation
Blueprint for single page web/hybrid front-end projects. With minimum code infrastructure, empty folders and a full-featured build tool (through [gulp](http://gulpjs.com/)).

## Usage
### 1. Create your project:
```
git clone https://github.com/bluekvirus/Stage.js-ng.git .
```
Don't forget the `.` in the end.

### 2. Initialize it:
```
bower install
npm install
```

### 3. Build/Watch Tasks:
```
gulp
gulp js --target libs,app
gulp amd
gulp watch --target css
gulp help
```
See [Gulpfile](gulpfile.js) for task definitions. 

You can also use a different build configure file by typing:
```
gulp -C, --config <name>
```
Always extend from the default configure file and put newly created configure under `./config`.


## Note
The `watch` task has good performance right now, it omits live js concatenation and lint-ing. You are encouraged to use a `lint` plugin in your code editor of choice. library/src concatenation should happen seldomly when developing in es6 or browserified commonjs.

`watch` task will, upon code change, only recompile/rebundle js, recompile less and recombine templates. If these basic tasks become bottlenecks we have candidate performance improvement (by caching) plugins to the rescue:

* gulp-cached (concat, copy related)
* gulp-remember (used with gulp-cached)
* browserify-incremental (js recompile)

These are excluded at the moment to favor a cleaner build structure. If you managed to add them in, say, in your super large web project, send us a pull-request and we will be happy to add your contribution to the code base.


## License
The [MIT](LICENSE) license.
