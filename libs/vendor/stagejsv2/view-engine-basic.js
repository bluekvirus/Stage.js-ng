/**
 * Basic View Engine. (Using Mustache.js as templating engine)
 *
 * Hardcode
 * --------
 * 1. templates must be named `*.mt.html`
 *
 * 
 */
(function(_, $, app, Mustache){

	//setup main view
	app.coordinator.on('app.initialize', function(){
		app.$container.html(app.view('main'));
		if($.material) $.material.init();
		app.coordinator.trigger('app.initialized');
	});

	//apis
	app.view = function(tpl, datanconfig){
		if(!_.endsWith(tpl, '.mt.html')) tpl += '.mt.html';
		return Mustache.render(app.templates[tpl], datanconfig);
	};

})(_, jQuery, Application, Mustache);