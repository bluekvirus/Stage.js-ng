app.ve.component({
	suggestedName: 'Banner',//in case we are using static mode instead of amd.

	init: function(ready){
		var self = this;
		app.com.ajax('data/sample.json').done(function(data){
			self.data = data;
			ready();
		});
	},

	coop: ['app:change-title'],
	events: {
		'render': function(){
			if($.material) $.material.init();
		},
		'app:change-title': function(e, title, major, minor, patch){
			var self = e.data.view;
			self.render({title: title, version: [major, minor, patch].join('.')});
			app.debug('ack', arguments);
		}
	}

});