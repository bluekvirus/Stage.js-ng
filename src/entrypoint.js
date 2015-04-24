//debug
app.coordinator.on('*', function(){app.debug(arguments);});

//minimal setup
app.start();

app.coordinator.on('app.navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});