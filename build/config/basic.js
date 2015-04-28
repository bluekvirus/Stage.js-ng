/**
 * Extend from the basic configure, to support using Ractive.js
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js');

config.javascript.libs.push(
	'libs/bower_components/mustache/mustache.js',
	'libs/vendor/stagejsv2/view-engine-basic.js'
);

config.templates = ['src/vanilla/**/*.mst.html'];

module.exports = config; 