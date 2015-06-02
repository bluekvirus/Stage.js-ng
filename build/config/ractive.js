/**
 * Extend from the basic configure, to support using Ractive.js
 *
 * @author Tim Lauv
 * @created 2015.04.27
 */
var config = require('./_base.js');

config.output = 'public/ractive';

config.javascript.libs.push(
	//-----------------------specific view engine------------------------
	'libs/bower_components/ractive/ractive.js',
	'libs/vendor/ractive-rcu/rcu.js',
	'libs/vendor/stagejsv2/view-engine-ractive.js',
	//----------------------additional widget libs-----------------------
	'libs/bower_components/bootstrap-material-design/dist/js/material.js',
	'libs/bower_components/bootstrap-material-design/dist/js/ripples.js'
);

config.stylesheet = 'styles/basic.less';

config.templates = ['src/components/**/*.ractive.html'];

config.assets.push({
	'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
});

module.exports = config; 