/**
 * Gulp build tasks.
 *
 * Tasks
 * -----
 * 1. style: LESS -> CSS -> /{dist}/css/main.css
 * 2. tpl: Templates (html) -> wrap into {name: content} -> /{dist}/templates.json
 * 3. js: JS -> [babel (es6)] -> [browserify (commonjs bundle)] -> /{dist}/app.js & vendor.js
 * 4. assets: Assets/* -> copy into /{dist}/*
 * 5. watch: Watching changes in the /app folder and trigger certain task(s)
 *
 * Configure
 * ---------
 * see ./config/base.js
 * 
 * Note
 * ----
 * js will always be linted and css will always be autoprefixed and cleaned.
 * However, to minify and gzip requires setting the production flag to true in configure.
 * 
 * 
 * @author Tim Lauv
 * @created 2015.02.19
 */