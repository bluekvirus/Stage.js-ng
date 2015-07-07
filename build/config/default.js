/**
 * Extend from the _base configure, support using:
 * 1. Default view engine (Stage.js v2 with Handlebars, Kendo-MVVM, [Velocity]).
 * 2. Twitter Bootstrap
 * 3. Bootstrap Material Design
 *
 * Important Note
 * --------------
 * This configure file indicates which View Engine you want to use. If you ever decided
 * to create a new configure file without extending this one, do NOT forget to include the 
 * view engine files. The `./_base.js` configure will not have them specified.
 * (see config.javascript.framework.push(...) below)
 *
 * Note that a specific View Engine will also requires a specific TPL Engine and optionally
 * an FX plugin bundle.
 * (see config.javascript.libs.push(...) below)
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
	//-----------------------------widgets-------------------------------
	'libs/bower_components/bootstrap/dist/js/bootstrap.js',
	'libs/bower_components/bootstrap-material-design/dist/js/material.js',
	'libs/bower_components/bootstrap-material-design/dist/js/ripples.js',
	//-----------------------------tpl engine, mvvm, fx plugins----------
	'libs/bower_components/handlebars/handlebars.js',
	'libs/bower_components/kendo-ui-core/src/js/kendo.core.js',
	'libs/bower_components/kendo-ui-core/src/js/kendo.data.js',
	'libs/bower_components/kendo-ui-core/src/js/kendo.binder.js',
	'libs/bower_components/velocity/velocity.js', //$.velocity - animation [optional, see view-engine.js]
	'libs/bower_components/velocity/velocity.ui.js' //$.velocity.RegisterEffect/RunSequence - animation-seq [optional]
);

config.javascript.framework.push(
	//-----------------------specific view engine------------------------
	'libs/vendor/stagejsv2/template-helpers-hbs.js',
	'libs/vendor/stagejsv2/view-engine.js'
);

config.stylesheet = 'styles/default.less';

config.templates = ['src/vanilla/**/*.hbs.html'];

config.assets.push({
	'libs/bower_components/bootstrap/dist/fonts/*': 'fonts',
	'libs/bower_components/bootstrap-material-design/dist/fonts/*': 'fonts'
});

module.exports = config; 