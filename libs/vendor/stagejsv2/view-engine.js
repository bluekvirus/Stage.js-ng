/**
 * View Engine adaptor for using Ractive.js
 *
 * Purpose
 * -------
 * 1. auto convert templates to web components (<custom tags>)
 * 2. hide Ractive global class and use app.view({...}) instead
 *
 *
 * Cheatsheets
 * -----------
 * http://ricostacruz.com/cheatsheets/ractive.html
 *
 * 
 * Documentation
 * -------------
 * http://docs.ractivejs.org/latest/options
 * http://docs.ractivejs.org/latest/advanced-configuration
 * 
 * 
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.22
 */

(function(_, $, app){

	//convert templates into web components
	app.coordinator.on('tpl.ready', function(){
		_.each(app.templates, function(tpl, name){
			name = _.trimRight(name, 'tpl.html');
			Ractive.components[_.capitalize(_.camelCase(name))] = Ractive.extend({
				template: tpl

				//TBI: need to offer a way to later combine component js (loaded through es6 in main.js) into it.
				
			});
		});

		app.components = Ractive.components;
	});

	//view api
	app.view = function(configure){

	};

})(_, jQuery, Application);