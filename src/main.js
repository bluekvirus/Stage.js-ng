import banner from './components/banner/script';

//debug
app.coordinator.on('*', function(){console.log(arguments);});

//minimal setup
app.start();
app.coordinator.on('app.setmainview', function($ct){
	$ct.html(app.templates['main.tpl.html']);
});
app.coordinator.on('app.navigate', function(ctx, item, rest){
	console.log('@context', ctx, '@item', item, '@rest', rest);
});