/**
 * The minimum app infrastructure for common SPA bootup.
 * (*requires lodash, jQuery, director and EventEmitter2)
 *
 * 
 * Process
 * -------
 * config -> load(tpl, i18n, ...) -> init(main view, $plugins, screen event, ...) -> ready
 *
 * 
 * APIs
 * -------
 * - .config
 * - ._load (->e app.load, requires firing app.loaded in hooks)
 * - ._init (->e app.initialize, requires firing app.initialized in hooks)
 * - ._ready (->e app.ready)
 * - .start (<ready event>, [handshake-mode?]) - entrypoint
 * - .navigate (->e app.navigate)
 * - .com.ajax (v2)
 * - [.com.socket (websocket)]
 * - [.com.peer (rtc)]
 * - .coordinator.on
 * - .coordinator.off
 * - .coordinator.once
 * - .coordinator.many
 * - .param (get single or all of ?... search string params in url)
 * - .debug (activate when ?debug=true, replacing console.log calls)
 * - .throw (same as throwing an exception)
 *
 *
 * Properties
 * ----------
 * - .$container
 * - .templates
 * - .routes
 * - .router
 * - .coordinator
 * - .com
 * - [.state]
 *
 * 
 * Bootup
 * -------
 * ###1. Setup (entrypoint.js)
 * ----------->----------->--------------->--------->
 * 	 					   *app.navigate, 
 * [app.load], [app.init], 			      [app.ready]			
 *  
 * ####Sample Code:
 * ```
 * app.config({...}).start([ready event]);
 *      
 * app.coordinator.on('app.navigate', function(ctx, item, rest){
 * 	console.log('@context', ctx, '@item', item, '@rest', rest);
 * });
 * ```
 * 
 * ###2. Extend (entrypoint.js)
 *
 * ####Sample Code:
 * ```
 * //Opt A. through events (recommended)
 * //load
 * app.coordinator.on('app.load', function(){
 * 	...
 * 	app.coordinator.trigger('app.loaded');
 * });
 * 
 * //initialize
 * app.coordinator.on('app.initialize', function($ct){
 * 	$ct.html(app.templates['main.tpl.html']);
 *  app.coordinator.trigger('app.initialized');
 * });
 *
 * //Opt B. override _.load, _.init
 * ```
 * Gotcha: If you listen to `app.load` or/and `app.initialize` make sure you emit/trigger/fire 
 * the `app.loaded` or/and `app.initialize` at the end of your listener. This is required for 
 * EVERY listener to these 2 events.
 * 
 * 
 * Navigation (default)
 * ----------
 * If you haven't changed the navigation implementation, here is the default behavior.
 * Each time the hash portion (/#...) changes a default navigation event will be triggered.
 * Listen to the `app.navigation` event will provide you with 3 unique params for determining
 * content on screen:
 * - context -- e.g Home, Products, About or Dashboard, User, Configurations...
 * - item -- e.g anything that's level 2 in a context
 * - rest -- e.g view1,view2,view3 suggesting what's currently showing within level 2
 *
 * Unlike `context` and `item`, `rest` can be anything you want including the `/` chars, it means
 * the rest of the hash uri.
 *
 * The default navigation mechanism does NOT include actual view handling and layout manipulation.
 * Implement yours in the `app.navigation` listener.
 *
 * 
 * View Manager/Engine (not included)
 * -------------------
 * Normally you would need to have at least one View manager loaded to enhance your html templates. 
 * It wrapps a View lib/engine (html,js object to view) that has layout management, interaction hooks
 * and transition control. Note that you should always bridge the apis of the underlying view engine 
 * whenever possible to minimize the cost in case of a engine swap.
 *
 * concept: js object (listeners) -> view
 *
 *
 * Form Generator (not included)
 * --------------
 * It would be a lot easier if you can generate form template and conditional control based on the 
 * form data (or schema) itself. Ideally this could be done by:
 * a. guess based on property types of a js object. (e.g {...}.form())
 * b. extract metadata from the server side app data definition as schema (e.g {...}.form({schema}))
 *
 * Obviously, a and b should be combined and a default list of html editors and wraps maintained.
 *
 * concept: html <input>, <select>, <textarea> + customizable wrapper = form editor tpl
 * concept: js object (data/schema) + form skeleton (fieldset/editor positions) = form tpl
 *
 *
 * Data Path
 * ---------
 * Use `app.com.ajax` ($.ajax) or add your own into `app.com`
 *
 *
 * App States (TBI)
 * ----------
 * state machine (`app.state`)
 * 
 * 
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.06
 */

(function(_, $, Router, EventEmitter){

	//application object
	var app = {
		$container: $('#app'),
		routes: {
			//default routing implementation (forward the navigation e, params):
			'/:context/?([^\/]*)/?(.*)': function(ctx, item, rest){
				app.coordinator.trigger('app.navigate', ctx, item, rest); //--> <*required>
			}
		},
		coordinator: new EventEmitter({
			wildcard: true, //enable a.* and a.*.c as event name
			delimiter: '.', //in between name segments (for wildcard matching)
			maxListeners: 10 //per event
		}),
		com: {
			ajax: $.ajax
		},
		//templates: {},
		_cache: {},

		//0. config (careful, it will override app it self)
		config: function(newcfg){
			return _.merge(this, newcfg);
		},

		//1. load external templates/components
		_load: function(){ //--> [override]
			//default *load* implementation:
			//a. load templates.json into app.templates.
			this.com.ajax({ url: 'templates.json', async: false }).done(function(tpls){
				app.templates = app.templates?_.merge(app.templates, tpls):tpls;
			});
			this.coordinator.trigger('app.load'); //--> [extend]
		},

		//2. runtime initialization
		_init: function(){ //--> [override]
			//default *init* implementation:
			//a. forward window resize, scroll events
			$window.resize(function(){
				app.coordinator.trigger('app.resize');
			});
			$window.scroll(function(){
				app.coordinator.trigger('app.scroll');
			});

			this.coordinator.trigger('app.initialize'); //--> [extend]
		},

		//3. kickoff navigation
		_ready: function(){
			//kick off navigation
			this.router = new Router(this.routes).init();
			this.coordinator.trigger('app.ready'); //--> [extend]
		},

		//entry point (support mobile ready event, and pause-by-each-step mode)
		start: function(e){ //--> [customizable mobile ready e]
			var that = this;
			$document.on(e || 'ready', function(){
				if(that.coordinator.listeners('app.load').length === 0)
					that.coordinator.on('app.load', function(){
						that.coordinator.trigger('app.loaded');
					});
				if(that.coordinator.listeners('app.initialize').length === 0)
					that.coordinator.on('app.initialize', function(){
						that.coordinator.trigger('app.initialized');
					});
				that.coordinator.many('app.loaded', that.coordinator.listeners('app.load').length, function(){
					that._init();
				});
				that.coordinator.many('app.initialized', that.coordinator.listeners('app.init').length, function(){
					that._ready();
				});
				that._load();
			});
		},

		//expose navigation api
		navigate: function(path){
			return this.router.setRoute(path);
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
				return console.log.apply(console.log, arguments);
		},
		throw: function(e){
			//e can be string, number or an object with .name and .message
			throw e;
		}
	};

	//enhance the coordinator.emit (+ event name, if no args, + trigger, fire as alias)
	//mask the coordinator.on/off to support wildcard '*' any event.
	var _oldemit = app.coordinator.emit;
	var _oldon = app.coordinator.on;
	var _oldoff = app.coordinator.off;
	app.coordinator.emit = app.coordinator.trigger = app.coordinator.fire = function(){
		if(arguments.length === 1)
			_oldemit.call(app.coordinator, arguments[0], arguments[0]);
		else
			_oldemit.apply(app.coordinator, arguments);
	};
	app.coordinator.on = function(){
		if(arguments.length === 2 && arguments[0] === '*')
			return app.coordinator.onAny(arguments[1]);
		return _oldon.apply(app.coordinator, arguments);
	};
	app.coordinator.off = function(){
		if(arguments.length === 2 && arguments[0] === '*')
			return app.coordinator.offAny(arguments[1]);
		return _oldoff.apply(app.coordinator, arguments);
	};
	

	//expose globals
	window.Application = window.app = app;
	window.$window = $(window);
	window.$document = $(document);

})(_, jQuery, Router, EventEmitter2);