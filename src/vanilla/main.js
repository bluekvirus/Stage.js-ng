app.ve.component(['banner'], {
	suggestedName: 'Main', //in case we are using static mode instead of amd.

	init: function(ready){
		app.coordinator.trigger('app:mainview-initialized');
		ready();
	},
	events: {
		'render': function(){
			if($.material) $.material.init();
			app.coordinator.trigger('app:mainview-rendered');
		},
		'teardown': function(){
			app.coordinator.trigger('app:mainview-closed');
		}
	}	
});