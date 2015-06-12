/**
 * Extend from the _base configure, support using the Default view engine (Stage.js v2).
 *
 * Important Note
 * --------------
 * This configure file indicates which View Engine you want to use. If you ever decided
 * to create a new configure file without extending this one, do NOT forget to include the 
 * view engine files. The `./_base.js` configure will not have them specified.
 * (see config.javascript.framework.push(...) below.)
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js');

config.output = 'public/default';

config.javascript.app = [
	'src/vanilla/**/*.js',
	'src/entrypoint.js'
];

config.javascript.libs.push(
	//------------------------additional widgets------------------------
	'libs/bower_components/bootstrap-material-design/dist/js/material.js',
	'libs/bower_components/bootstrap-material-design/dist/js/ripples.js'
);

config.javascript.framework.push(
	//-----------------------specific view engine------------------------
	'libs/bower_components/handlebars/handlebars.js',
	'libs/vendor/stagejsv2/template-helpers-hbs.js',
	'libs/vendor/stagejsv2/view-engine.js'
);

config.stylesheet = 'styles/default.less';

config.templates = ['src/vanilla/**/*.hbs.html'];

config.assets.push({
	'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
});

module.exports = config; 