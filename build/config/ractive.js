/**
 * Extend from the basic configure, to support using Ractive.js
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js');

config.javascript.libs.push(
	'libs/bower_components/ractive/ractive.js',
	'libs/vendor/ractive-rcu/rcu.js',
	'libs/vendor/stagejsv2/view-engine-ractive.js'
);

config.templates = ['src/components/**/*.ractive.html'];

config.output = 'public/ractive';

module.exports = config; 