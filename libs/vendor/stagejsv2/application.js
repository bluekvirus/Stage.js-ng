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
		coordinator: new EventEmitter(),
		templates: {},
		com: {
			ajax: $.ajax
		}
	};

	//load templates (blocking)
	app.com.ajax({ url: 'templates.json', async: false }).done(function(tpls){
		app.templates = tpls;
	});

	//kick start
	$(document).on('ready', function(){

		//setup main view
		app.container.html(app.templates['main.tpl.html']);

		//special init for dependencies.
		app.router.init();
		if($.material) $.material.init();

		//broadcast ready event
		app.coordinator.emit('appready');

	});

	//expose app as global
	window.app = app;

})(_, jQuery, Router, EventEmitter2);