/**
 * Extend from the _base configure, support using:
 * 1. Semantic UI
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
	'libs/bower_components/semantic-ui/dist/semantic.js'
);

config.stylesheet = 'styles/' + name + '.less';

config.templates = ['src/' + name + '/**/*.hbs.html'];

config.assets.push({
	'libs/vendor/gwebfonts/Lato/*':'fonts',
	'libs/bower_components/semantic-ui/dist/themes/default/assets/fonts/*':'fonts',
	'libs/bower_components/semantic-ui/dist/themes/default/assets/images/*':'images',
});

module.exports = config; 