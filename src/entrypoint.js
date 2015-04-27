//debug
app.coordinator.on('*', function(){app.debug(arguments);});

//minimal setup
app.config().start();

app.coordinator.on('app.navigate', function(ctx, item, rest){
	app.debug('@context', ctx, '@item', item, '@rest', rest);
});