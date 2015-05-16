//setup
app.config();

//initialize main view
app.coordinator.on('app.initialize', function(){
	var init = function(){
		new app.ve.components.Main({el: app.$container});
		app.coordinator.trigger('app.initialized');
	};
	if(app.isAMDEnabled())
		app.ve.inject('main', function(){
			init();
		});
	else
		init();
});

//listen to navigation event
app.coordinator.on('app.navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});

if(app.isAMDEnabled())
	define(function(){
		$(function(){app.start();});
	});
else
	$(function(){app.start();});