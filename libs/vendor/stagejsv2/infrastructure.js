(function(_, $, Router, EventEmitter){

	//setup 
	//	ready e, 
	//	routing(selector, pattern, listener)
	//	states
	//	screen/scroll/key/click
	//	init cb
	//api
	//	.com.ajax (v2)
	//	.com.socket (websocket)
	//	.com.peer (rtc)

	//application object
	var app = {
		container: $('#app'),
		router: Router(),
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

		//2. setup main view (override this!)
		setup: function(){
			app.container.html(app.templates['main.tpl.html']);
			this.coordinator.emit('mainview.ready');
		},

		//3. init router & ui special
		init: function(){
			this.router.init();
			if($.material) $.material.init();
			this.coordinator.emit('app.init');
		},

		//entry point
		start: function(){
			this.load();
			this.setup();
			this.init();
			this.coordinator.emit('app.ready');
		}
	};

	//kick start
	$(document).on('ready', function(){
		app.start();
	});

	//expose app as global
	window.app = app;

})(_, jQuery, Router, EventEmitter2);