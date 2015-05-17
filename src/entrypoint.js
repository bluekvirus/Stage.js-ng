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

//kickstart app
var start = function(){
	$(function(){app.start();});
};
if(app.isAMDEnabled())
	define(function(){
		app.ve.inject('main', start);
	});
else
	start();