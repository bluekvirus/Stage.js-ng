app.ve.component({
	suggestedName: 'Banner',//in case we are using static mode instead of amd.

	init: function(ready){
		var self = this;
		app.com.ajax('data/sample.json').done(function(data){
			self.data = data;
			ready();
		});

		//regression: on/once {view: self} auto inject.
		// this.on('render', function(e){
		// 	app.debug('2', (e.data && e.data.view)?true: false);
		// }).once('click', 'li', function(e){
		// 	app.debug('3-1', (e.data && e.data.view)?true: false);
		// }).on('render', {mock: true}, function(e){
		// 	app.debug('3-2', (e.data && e.data.view)?true: false);
		// }).once('click', 'li', {mock: false}, function(e){
		// 	app.debug('4', (e.data && e.data.view)?true: false);
		// });
	},

	bindings: true, //enable MVVM
	coop: ['app:change-title'],
	events: {
		'render': function(){
			if($.material) $.material.init();
		},
		'app:change-title': function(e, title, major, minor, patch){
			var self = e.data.view;
			self.render({title: title, version: [major, minor, patch].join('.')});
			app.debug('ack', arguments);
		},
		'vm:change': function(e, signal){
			app.debug('detected', e.type, signal.field || signal.action);
		}
	}

});