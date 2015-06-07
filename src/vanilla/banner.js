app.ve.component({
	suggestedName: 'Banner',

	coop: ['app:change-title'],
	events: {
		'app:change-title': function(e, title, major, minor, patch){
			var self = e.data.view;
			self.render({title: title, version: [major, minor, patch].join('.')});
			app.debug('ack', arguments);
		}
	}

});