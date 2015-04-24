/**
 * View Engine adaptor for using Ractive.js
 *
 * Purpose
 * -------
 * 1. auto convert templates to web components (<custom tags>)
 * 2. hide Ractive global class and use app.ve.view({...}) instead
 *
 * Plugins (to app)
 * ----------------
 * app.ve
 * app.ve.view
 * app.ve.components
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
 * Gotcha
 * ------
 * Hardcode: Remember to put your Ractive components *.tpl.html under 'src/components'
 * 
 * 
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.22
 */

(function(_, $, app, Ractive, RactiveUtil){
	app.ve = {};
	Ractive.DEBUG = app.param('debug', false);
	RactiveUtil.init(Ractive);

	//-----------------hooks into app infrastructure-------------------
	//convert templates into web components
	app.coordinator.on('app.load', function(){

		var done = _.after(_.size(app.templates), function(){
			app.coordinator.trigger('app.loaded');
		});

		_.each(app.templates, function(tpl, filename){
			var componentPath = filename.split('tpl.html')[0];
			componentPath = _.trimLeft(componentPath, 'components')/*Hardcode!*/;
			app.debug(filename, '=>', componentPath);

			var name = _.capitalize(_.camelCase(componentPath));
			RactiveUtil.make(tpl, {
				url: filename,
				loadImport: function(tag, path, parentUrl, cb){

					//TBI: Not working atm for nested components.
					app.debug('sub-comp:', tag, path, parentUrl);
					cb(app.templates[name + tag]);
				}
			}, function(component){
				Ractive.components[name] = component;
				app.debug('component ready:', name);
				done();
			});
		});

		app.ve.components = Ractive.components;
	});

	//setup main view
	app.coordinator.on('app.initialize', function(){
		new app.ve.components.Main({el: app.$container}); 
		app.coordinator.trigger('app.initialized');
	});

	//----------------apis enhancement to app-------------------------
	//view api
	app.ve.view = function(configure){
		return new Ractive(configure);
	};

	//component api
	app.ve.component = function(name, configure){
		Ractive.components[name] = Ractive.extend(configure);
		return app.ve.components[name];
	};

})(_, jQuery, Application, Ractive, rcu);