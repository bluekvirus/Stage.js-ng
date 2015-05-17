/**
 * View Engine adaptor for using Ractive.js
 *
 * Purpose
 * -------
 * 1. auto convert templates to web components (<custom tags>)
 * 2. hide Ractive global class and use `app.ve.view({...})` instead
 *
 * 
 * Plugins (to app)
 * ----------------
 * app.ve
 * app.ve.view
 * app.ve.component
 * app.ve.components
 * 
 *
 * Use of View
 * -----------
 * see cheatsheets and documentation below
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
 * `<component>/index.ractive.html` means the main template of `<component>`, sub-components 
 * can be ref-ed using `<ComponentSubSub...>` in the main template. the original 
 * `<link ref=...>` dep loading is removed for simpler component registeration. 
 * In other words, nested components will reflect their origin/relation ONLY in the name.
 *
 * 
 * Hardcode
 * --------
 * 1. components must be named `*.ractive.html`
 * 
 * 
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.22
 */

(function(_, $, app, Ractive, RactiveUtil){
	app.ve = {name: 'Ractive', _tplSuffix: '.ractive.html'};

	//----------------patching Ractive---------------------------------
	Ractive.DEBUG = app.param('debug', false);
	_.extend(Ractive.prototype, {
		trigger: Ractive.prototype.fire,
		emit: Ractive.prototype.fire
	});
	RactiveUtil.init(Ractive);

	//-----------------hooks into app infrastructure-------------------
	//convert templates into web components
	app.coordinator.on('app.load', function(){

		//since rcu uses promise, we need to wait for all conversions to complete
		var done = _.after(_.size(app.templates), function(){
			app.coordinator.trigger('app.loaded');
		});

		_.each(app.templates, function(tpl, filename){
			var name = app.tplNameToCompName(filename, app.ve._tplSuffix);
			RactiveUtil.make(tpl, {
				url: filename,
				loadImport: function(tag, path, parentUrl, cb){
					app.throw('dependency <link> tag not supported.');
				}
			}, function(component){
				Ractive.components[name] = component;
				app.debug('component ready:', name);
				done();
			});
		});

		app.ve.components = Ractive.components || {};
	});

	//-------------------apis enhancement to app-----------------------
	//view api (-> instance)
	app.ve.view = function(configure){
		return new Ractive(configure);
	};

	//component api (-> class)
	app.ve.component = function(name, configure){
		if(app.ve.components[name])
			app.ve.components[name] = app.ve.components[name].extend(configure);
		else
			app.ve.components[name] = Ractive.extend(configure);
		return app.ve.components[name];
	};

})(_, jQuery, Application, Ractive, rcu);