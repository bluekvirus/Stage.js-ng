/**
 * Extend from the _base configure, to support using Stage.js v2
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js');

config.output = 'public/default';

config.javascript.libs.push(
	//-----------------------specific view engine------------------------
	'libs/bower_components/handlebars/handlebars.js',
	'libs/vendor/stagejsv2/view-engine-default.js',
	//----------------------additional widget libs-----------------------
	'libs/bower_components/bootstrap-material-design/dist/js/material.js',
	'libs/bower_components/bootstrap-material-design/dist/js/ripples.js'
);

config.stylesheet = 'styles/default.less';

config.templates = ['src/vanilla/**/*.hbs.html'];

config.assets.push({
	'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
});

module.exports = config; 