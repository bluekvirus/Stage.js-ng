//debug
app.coordinator.on('*', function(){app.debug(arguments);});

//minimal setup
app.start();
app.coordinator.on('app.setmainview', function($ct){
	//A. basic
	//$ct.html(app.templates['main.tpl.html']);
	
	//B. with View Engine (Ractive).
	new app.ve.components.Main({el: $ct}); 
});
app.coordinator.on('app.navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});