//setup
app.config({
	//normally you don't need this configure, this is just in case you want to put src into a sub-folder.
	amd: {
		commonRoot: 'default/'
	}
});

//initialize main view
app.coordinator.on('app:initialize', function(){
	new (app.ve.get('main'))({el: app.$container});
	app.coordinator.trigger('app:initialized');
});

//listen to navigation event
app.coordinator.on('app:navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});

//kickstart app (with support to AMD)
if(app.isAMD())
	define(function(){
		app.ve.inject('main', app.start);
	});
else
	app.start();