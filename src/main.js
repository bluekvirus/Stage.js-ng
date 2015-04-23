import banner from './banner/script';

//debug
app.coordinator.on('*', function(){console.log(arguments);});

//minimal setup
app.start();
app.coordinator.on('app.setmainview', function($ct){
	//A. basic
	//$ct.html(app.templates['main.tpl.html']);
	
	//B. with View Engine (Ractive).
	new app.components.Main({el: $ct}); 
});
app.coordinator.on('app.navigate', function(ctx, item, rest){
	console.log('@context', ctx, '@item', item, '@rest', rest);
});