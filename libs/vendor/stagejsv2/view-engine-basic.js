/**
 * Basic View Engine. (Using Mustache.js as templating engine)
 *
 * Hardcode
 * --------
 * 1. templates must be named `*.mst.html`
 *
 *
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.27
 */
(function(_, $, app, Mustache){
	app.ve = {};

	//------------------------View class definition----------------------
	//.template, .$el, .data, .render(), .teardown(), .events, .trigger()
	//constructor
	var View = function(options){
		this._options = options || {};

		//required
		if(!options.template) app.throw('View definition requires a template!');
		options.template = _.endsWith('.mst.html')?options.template:(options.template + '.mst.html');
		if(!app.templates[options.template]) app.throw('Template not found! ' + options.template);
		Mustache.parse(app.templates[options.template]);
		this.template = app.templates[options.template];
		
		//optional
		this.$el = this._options.$el;
		this.data = this._options.data;

	};
	//member methods
	_.extend(View.prototype, {
		render: function(datanconfig, $el){
			var content = Mustache.render(this.template, datanconfig || this._options.data);
			
			this.$el = $el || this.$el;
			this.data = datanconfig || this.data;

			if(this.$el) {
				this.$el.html(content);
				if(!$.hasData(this.$el, '_events_')) {
					this.$el.on(this._options.events);
					this.$el.data('_events_', true);
				}
				this.$el.data('view', this);
			}
			else return content;

			this.trigger('rendered');
			return this;
		},

		teardown: function(){
			if(this.$el){
				this.$el.off();
				this.$el.removeData('_events_');
				this.$el.empty();
			}
		},

		//dynamic instance events support .once, .trigger
		//use options.events for .on
		once: function(){
			if(this.$el) {
				this.$el.one.apply(this.$el, arguments);
				this.$el.data('_events_', true);
			}
		},

		trigger: function(){
			if(this.$el) {
				this.$el.trigger.apply(this.$el, arguments);
			}
		}
	});

	//-----------------hooks into app infrastructure-------------------
	//setup main view
	app.coordinator.on('app.initialize', function(){
		app.ve.view({
			template: 'main',
			$el: app.$container,
			events: {
				'rendered': function(){
					if($.material) $.material.init();
					app.debug('main view rendered');
				} 
			}
		}).render();
		
		app.coordinator.trigger('app.initialized');
	});

	//----------------apis enhancement to app-------------------------
	app.ve.view = function(options){
		return new View(options);
	};

})(_, jQuery, Application, Mustache);