/**
 * Gulp build tasks.
 *
 * Tasks
 * -----
 * 1. style: LESS -> CSS -> /{dist}/css/main.css (+prefix, +clean)
 * 2. tpl: Templates (html) -> wrap into {name: content} -> /{dist}/templates.json
 * 3. js: JS -> [babel (es6)] -> [browserify (commonjs bundle)] -> /{dist}/app.js & vendor.js (+lint)
 * 4. assets: Assets/* -> copy into /{dist}/*, copy and rename/merge certain file/folder
 * 5. compress: minify and gzip the *.js and *.css in the output folder.
 * 6. watch: Watching changes in the /app folder and trigger certain task(s)
 *
 * Configure
 * ---------
 * see ./config/base.js
 * 
 * Note
 * ----
 * 1. Javascripts will always be **linted** and css will always be **autoprefixed** and **cleaned**.
 * 2. To minify and gzip requires setting the production flag to true in configure.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 */