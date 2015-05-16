define({
	init: function(options){
		app.coordinator.trigger('app.mainview-initialized');
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