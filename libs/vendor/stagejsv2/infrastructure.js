(function(_, $, Router, EventEmitter){

	//setup 
	//	ready e, 
	//	routing(pattern[implied selector],  listener)
	//	states
	//	screen/scroll/key/click
	//api
	//	.config
	//	.load (->e tpl.ready)
	//	.init (->e mainview.setup, app.init)
	//	.start (->e app.ready)
	//	.navigate (->e app.navigate)
	//	.com.ajax (v2)
	//	[.com.socket (websocket)]
	//	[.com.peer (rtc)]

	//application object
	var app = {
		container: $('#app'),
		routes: {
			'/:context/?([^\/]*)/?(.*)': function(ctx, item, rest){
				app.coordinator.emit('app.navigate', ctx, item, rest);
			}
		},
		coordinator: new EventEmitter({
			delimiter: '.'
		}),
		templates: {},
		com: {
			ajax: $.ajax
		},

		//0. config (careful, it will override app it self)
		config: function(newcfg){
			_.merge(this, newcfg);
		},

		//1. load templates/components
		load: function(){
			this.com.ajax({ url: 'templates.json', async: false }).done(function(tpls){
				app.templates = tpls;
				app.coordinator.emit('tpl.ready');
			});
		},

		//2. setup main view, init router & $.plugins
		init: function(){
			app.coordinator.emit('mainview.setup', app.container);
			this.router = new Router(this.routes).init();
			if($.material) $.material.init();
			this.coordinator.emit('app.init');
		},

		//3. navigation api
		navigate: function(path){
			return this.router.setRoute(path);
		},

		//entry point (support mobile ready event)
		start: function(e){
			var that = this;
			$(document).on(e || 'ready', function(){
				that.load();
				that.init();
				that.coordinator.emit('app.ready');
			});
		}
	};

	//fix the coordinator.emit (+ event name, if no args)
	var _oldemit = app.coordinator.emit;
	app.coordinator.emit = function(){
		if(arguments.length === 1)
			_oldemit.call(app.coordinator, arguments[0], arguments[0]);
		else
			_oldemit.apply(app.coordinator, arguments);
	};
	

	//expose app as global
	window.app = app;

})(_, jQuery, Router, EventEmitter2);