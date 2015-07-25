/**
 * For testing purposes only (Stagejsv2)
 * 
 * @author Tim Lauv
 * @created 2015.07.24
 */
var config = require('./_base.js'),
name = require('path').basename(__filename, '.js');

config.output = 'public/' + name;

config.javascript.tests = [
	'test/**/*.js'
];

config.javascript.libs.push(
	'libs/bower_components/chai/chai.js',
	'libs/bower_components/mocha/mocha.js'
);

delete config.javascript.app;
delete config.stylesheet;
delete config.templates;

config.assets = [
	'test/index.html',
	{
		'libs/bower_components/modernizr/modernizr.js':'js',
		'libs/bower_components/mocha/mocha.css': 'css',
	},
];

module.exports = config; 