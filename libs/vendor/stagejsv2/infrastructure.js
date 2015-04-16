/**
 * The minimum app infrastructure for common SPA bootup.
 * (*requires lodash, jQuery, director and EventEmitter2)
 *
 * Process
 * -------
 * config -> load(tpl, i18n, ...) -> init(main view, $plugins, screen event, ...) -> ready
 * 
 * Core
 * -------
 * - main container 
 * - templates (cache)
 * - default routing (pattern[implied selector],  listener[forward event])
 * - coordinator (central event emitter)
 * - [states]
 * 	
 * APIs
 * -------
 * - .config
 * - .load (->e tpl.ready, app.load)
 * - .init (->e app.setmainview, app.init)
 * - .start (->e app.ready)
 * - .navigate (->e app.navigate)
 * - .com.ajax (v2)
 * - [.com.socket (websocket)]
 * - [.com.peer (rtc)]
 * - .coordinator.on
 * - .coordinator.off
 * - .coordinator.once
 * - .coordinator.many
 *
 * Bootup
 * -------
 * setup/extend (use app.coordinator in main.js)
 * ------------->----------->----------------->----------->-------------->---------->
 * 	*tpl.ready, 			*app.setmainview, 			  *app.navigate, 
 *  			[app.load], 				  [app.init], 				 [app.ready]			
 *  
 *  * means the event is important and should have a listener in main.js
 *  ```
 *  	//main.js - example
 *   	app.start();
 *    	
 *    	app.coordinator.on('app.setmainview', function($ct){
 *  	  $ct.html(app.templates['main.tpl.html']);
 *     	});
 *      
 *      app.coordinator.on('app.navigate', function(ctx, item, rest){
 *  	  console.log('@context', ctx, '@item', item, '@rest', rest);
 *      });
 *  ```
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
			delimiter: '.'
		}),
		com: {
			ajax: $.ajax
		},
		//templates: {},

		//0. config (careful, it will override app it self)
		config: function(newcfg){
			_.merge(this, newcfg);
		},

		//1. load templates/components
		load: function(){ //--> [override]
			//default *load* implementation:
			//a. load templates.json into app.templates.
			this.com.ajax({ url: 'templates.json', async: false }).done(function(tpls){
				app.templates = app.templates?_.merge(app.templates, tpls):tpls;
				app.coordinator.trigger('tpl.ready'); //--> [*required if building web componets]
			});

			this.coordinator.trigger('app.load'); //--> [extend]
		},

		//2. setup main view, init router & $.plugins
		init: function(){ //--> [override]
			//default *init* implementation:
			//a. mount main view into app container
			app.coordinator.trigger('app.setmainview', app.$container); //--> <*required>
			//b. init material design plugins
			if($.material) $.material.init();
			//c. forward window resize, scroll events
			$window.resize(function(){
				app.coordinator.trigger('app.resize');
			});
			$window.scroll(function(){
				app.coordinator.trigger('app.scroll');
			});

			this.coordinator.trigger('app.init'); //--> [extend]
		},

		//3. entry point (support mobile ready event)
		start: function(e){ //--> [customizable mobile ready e]
			var that = this;
			$document.on(e || 'ready', function(){
				that.load();
				that.init();
				//kick off navigation
				that.router = new Router(that.routes).init();

				that.coordinator.trigger('app.ready'); //--> [extend]
			});
		},

		//3+. expose navigation api
		navigate: function(path){
			return this.router.setRoute(path);
		},
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
	window.app = app;
	window.$window = $(window);
	window.$document = $(document);

})(_, jQuery, Router, EventEmitter2);