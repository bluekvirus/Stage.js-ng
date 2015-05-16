//setup
app.config();

//initialize main view
app.coordinator.on('app.initialize', function(){
	new app.ve.components.Main({el: app.$container});
	app.coordinator.trigger('app.initialized');
});

//listen to navigation event
app.coordinator.on('app.navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});

if(typeof define === "function" && define.amd)
	//TBI: move this to app.ve.inject('main');
	(function(){
		define(['text!vanilla/main.mst.html'], function(tpl){
			app.ve.component('Main', {
				template: tpl
			});
			return app;
		});
	})('main');
else
	$(function(){app.start();});