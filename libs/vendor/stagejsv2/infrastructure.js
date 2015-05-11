/**
 * The minimum app infrastructure for common SPA bootup.
 * (*requires lodash, jQuery)
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
 * - .start (<ready event>) - entrypoint
 *
 * plugin: com
 * - .com.ajax (v2)
 * - [.com.socket (websocket)]
 * - [.com.peer (rtc)]
 *
 * plugin: coop
 * - .coordinator.on
 * - .coordinator.off
 * - .coordinator.once
 * - .coordinator.many
 *
 * plugin: navigation
 * - .navigate (path)
 *
 * plugin: utils
 * - .tplNameToCompName (convert template filename to component class name)
 * - .param (get single or all of ?... search string params in url)
 * - .debug (activate when ?debug=true, replacing console.log calls)
 * - .throw (same as throwing an exception)
 *
 * plugin: view-engine
 * - .ve.view
 * - .ve.component
 * 
 *
 * Properties
 * ----------
 * - .$container
 * - .templates
 *
 * plugin: navigation
 * - .routes
 * - .router
 *
 * plugin: coop
 * - .coordinator
 *
 * plugin: com
 * - .com
 *
 * plugin: view-engine
 * - .ve
 * - .ve.components
 * 
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
 * Navigation (plugin)
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
 * View Manager/Engine (plugin)
 * -------------------
 * Normally you would need to have at least one View manager loaded to enhance your html templates. 
 * It wrapps a View lib/engine (html,js object to view) that has layout management, interaction hooks
 * and transition control. Note that you should always bridge the apis of the underlying view engine 
 * whenever possible to minimize the cost in case of a engine swap.
 *
 * concept: js object (listeners) -> view
 *
 *
 * Communication (plugin)
 * -------------
 * Use `app.com.ajax` ($.ajax) or add your own into `app.com`
 *
 *
 * I18N (plugin)
 * ----
 * '...'.i18n, $.fn.i18n
 *
 *
 * Coordination (plugin)
 * ------------
 * app.coordinator (co-op events)
 * 
 *
 * Utils (plugin)
 * -----
 * debug logging
 * url query params
 * 
 *
 * Form Generator (TBI)
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
 * App States (TBI)
 * ----------
 * state machine (`app.state`)
 * 
 * 
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.06
 */

(function(_, $){

	//application object
	var app = {
		$container: $('#app'),
		com: {
			ajax: $.ajax
		},
		templates: {},

		//0. config (careful, it will override app it self)
		config: function(newcfg){
			return _.merge(this, newcfg);
		},

		//1. load external templates/components
		_load: function(){ //--> [override]
			//default *load* implementation:
			//a. load templates.json into app.templates.
			this.com.ajax({ url: 'templates.json' }).done(function(tpls){
				app.templates = app.templates?_.merge(app.templates, tpls):tpls;

				app.coordinator.trigger('app.load'); //--> [extend]
			});

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
				that.coordinator.on('app.loaded', _.after(that.coordinator.listeners('app.load').length, function(){
					that._init();
				}));
				that.coordinator.on('app.initialized', _.after(that.coordinator.listeners('app.initialize').length, function(){
					that._ready();
				}));
				that._load();
			});
		}
	};	

	//expose globals
	window.Application = window.app = app;
	window.$window = $(window);
	window.$document = $(document);

})(_, jQuery);
