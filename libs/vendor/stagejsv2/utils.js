/**
 * Infrastructure Plugin: Common Utilities
 *
 * @author Tim Lauv
 * @created 2015.05.10
 */

(function(app, _){

	app.config({
		_cache: {},

		isAMDEnabled: function(){
			return typeof define === "function" && define.amd;
		},

		//convert template file name to view/component class name
		tplNameToCompName: function(filename, suffix){
			suffix = suffix || '.tpl.html';
			var componentPath = filename.replace(suffix, '');
			if(_.endsWith(componentPath, 'index')) componentPath = componentPath.replace('index', '');
			componentPath = _.capitalize(_.camelCase(componentPath));
			app.debug('resolve name/path to component', filename, '=>', componentPath);

			return componentPath;
		},

		//debug logging/exception throwing shortcut
		param: function(key, defaultval){
			//return single param value in the ?... search string in url or all of them.
			//-------
			// Gotcha: If you modify the ?... query string without hitting enter, params won't change.
			//-------
			if(app._cache.searchstring !==  window.location.search.substring(1)){
				var params = {};
				app._cache.searchstring = window.location.search.substring(1);
				_.each(app._cache.searchstring.split('&'), function(pair){
					pair = pair.split('=');
					params[pair[0]] = pair[1];
				});
				app._cache.params = params;
			}
			if(key)
				return _.isUndefined(app._cache.params[key])? defaultval : app._cache.params[key];
			return app._cache.params;
		},

		debug: function(){
			//as console.log wrapper
			if(app.param('debug') === 'true')
				return console.log.apply(console, arguments);
		},

		throw: function(e){
			//e can be string, number or an object with .name and .message
			throw e;
		}
	});

	//debug: show coop events
	if(app.param('debug'))
		app.coordinator.on('*', function(){app.debug(arguments);});


})(Application, _);