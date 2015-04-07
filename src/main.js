import banner from './components/banner/script';

//debug
app.coordinator.onAny(function(){console.log(arguments);});

app.start();

app.coordinator.on('mainview.setup', function(ct){
	ct.html(app.templates['main.tpl.html']);
});
app.coordinator.on('app.navigate', function(ctx, item, rest){
	console.log('@context', ctx, '@item', item, '@rest', rest);
});