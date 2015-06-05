app.ve.component(['banner'], {
	init: function(options, ready){
		app.coordinator.trigger('app.mainview-initialized');
		ready();
	},
	events: {
		'render': function(){
			if($.material) $.material.init();
			app.coordinator.trigger('app.mainview-rendered');
		},
		'teardown': function(){
			app.coordinator.trigger('app.mainview-closed');
		}
	}	
});