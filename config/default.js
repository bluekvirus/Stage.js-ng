/**
 * Extend from the _base configure, support using:
 * 1. Twitter Bootstrap
 * 2. Bootstrap Material Design
 *
 * Important Note
 * --------------
 * This configure file specifies which templating framework, widgets and assets to use.
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js'),
name = require('path').basename(__filename, '.js'); //use config name as namespace in (public, src, styles).

config.output = 'public/' + name;

config.javascript.app = [
	'src/' + name + '/**/*.js',
	'src/entrypoint.js'
];

config.javascript.libs.push(
	//-----------------------tpl framework, widgets-----------------------
	'libs/bower_components/bootstrap/dist/js/bootstrap.js',
	'libs/bower_components/bootstrap-material-design/dist/js/material.js',
	'libs/bower_components/bootstrap-material-design/dist/js/ripples.js',
	'libs/bower_components/snackbarjs/src/snackbar.js',
	'libs/bower_components/nouislider/distribute/nouislider.js'
);

config.stylesheet = 'styles/' + name + '.less';

config.templates.src = ['src/' + name + '/**/*.hbs.html'];
//changed from config.templates to config.templates.src
config.assets.push({
	'libs/bower_components/fontawesome/fonts/*':'fonts',
	'libs/bower_components/bootstrap/dist/fonts/*': 'fonts',
	'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
});

module.exports = config; 