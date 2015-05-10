/**
 * Basic View Engine. (Using Mustache.js as templating engine)
 *
 * Plugins (to app)
 * ----------------
 * app.ve
 * app.ve.view
 * $(el).data('view')
 *
 *
 * Use of View
 * -----------
 * 1. new View({
 * 		template: [name],
 * 		[init]: function(){...}
 * 		[$el]:
 * 		[data]:
 * 		[events]:
 * })
 * 2. view.render(data, [$el])
 * 3. view.on/trigger/once/off()
 * 4. view.teardown()
 * 5. View.extend({...})
 * 
 *
 * Life cycle
 * ----------
 * init() --> render(e) --> render(e) ... --> teardown(e)
 * 
 * *Note*: that due to implemenation constrains (using $el for events) init() will not emit any `initialize` event.
 * 
 * 
 * Ghost View
 * ----------
 * 1. only views with `$el` can be rendered on screen, otherwise html is returned by `.render()`;
 * 2. only `template` name is required when defining a View, `data` and `$el` can be inserted later using `.render()`;
 * 3. only views with `$el` can register events;
 * 4. rendering same view again and again will not re-register the listeners;
 * 5. rendering a new view on a `$el` will `.teardown()` the previous view if template names are different;
 * 6. `.teardown()` will not `$.remove()` a view's `$el`, but `$.empty()` it and remove all the event listeners;
 *
 * Ghost View will NOT happen in this implementation since jQuery removes data and event handlers from child
 * elements during `$.empty()`. If you render parent `$el` with a new view, child views will be removed properly
 * given that we bind everything on the `$el` through jQuery.
 *
 *
 * Gotcha
 * ------
 * 1. If you use `app.coordinator.on` for co-op with other things in the application, make sure to use the `teardown`
 * event to clean things up.
 * 2. there are no `on<event>` shortcut functions for listeners in a view. use `.on`/`.once` and `options.events` to 
 * register them instead.
 * 
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
	app.ve = {name: 'Basic'};

	//--------------------------------View class definition---------------------------------
	//.template, .$el, .data, init() .render(e), .teardown(e), .events, .once/on/off/trigger()
	//constructor (logic-free)
	var View = function(options){
		this._options = options || {};
		
		//optional
		this.$el = this._options.$el || this.$el;
		this.data = this._options.data || this.data;
		this.init = this._options.init || this._options.initialize || this.init;
		this.events = this._options.events || this.events;
		this.template = this._options.template || this.template;

		//extension point
		this.init(this._options);
	};
	//member methods
	_.extend(View.prototype, {
		init: _.noop,

		render: function($el, data){

			//check the template first!
			if(!this.template) app.throw('View definition requires a template!');
			this.template = _.endsWith('.mst.html')?this.template:(this.template + '.mst.html');
			if(!app.templates[this.template]) app.throw('Template not found! ' + this.template);			
			
			this.$el = $el || this.$el;
			this.data = data || this.data;

			var content = Mustache.render(app.templates[this.template], this.data);

			if(this.$el) {
				//teardown previous view if template is different.
				var meta = this.$el.data();
				if(meta.view && (meta.view.template !== this.template))
					meta.view.teardown();

				//re-render but not registering the listeners again.
				this.$el.html(content);
				if(!this.$el.data('_events_')) {
					this.$el.on(this.events);
					this.$el.data('_events_', true);
				}
				this.$el.data('view', this);
			}
			else return content;

			this.trigger('render');
			return this;
		},

		teardown: function(){
			if(this.$el){
				this.$el.removeData('_events_', 'view');
				this.$el.empty();
				this.trigger('teardown');
				this.off();
			}
		},

		//dynamic instance events support .once, .trigger
		//use options.events for easy .on listener registration.
		once: function(){
			if(this.$el) {
				this.$el.one.apply(this.$el, arguments);
				this.$el.data('_events_', true);
			}
		},

		on: function(){
			if(this.$el) {
				this.$el.on.apply(this.$el, arguments);
				this.$el.data('_events_', true);
			}
		},

		off: function(){
			if(this.$el) {
				this.$el.off.apply(this.$el, arguments);
			}
		},

		trigger: function(){
			if(this.$el) {
				this.$el.trigger.apply(this.$el, arguments);
			}
		},
	});
	//static methods
	_.extend(View, {
		//class inheritance
		extend: function(configure, statics){
			var A = this.prototype.constructor;

			var B = function(options){
				A.apply(this, options);
			};

			B.prototype = new A(); //logic-free constructor
			_.extend(B.prototype, configure);
			_.extend(B, A, statics); 
			//note that `prototype` and `constructor` are non-enumerable, thus won't be copied by _.extend()

			B.prototype.constructor = B;

			return B;
		}
	});

	//-----------------hooks into app infrastructure-------------------
	//setup main view
	app.coordinator.on('app.initialize', function(){
		app.ve.component('Main', {
			template: 'main',
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

		(new app.ve.components.Main()).render(app.$container);
		
		app.coordinator.trigger('app.initialized');
	});

	//----------------apis enhancement to app-------------------------
	app.ve.view = function(options){
		return new View(options);
	};

	app.ve.components = {};
	app.ve.component = function(name, configure){
		if(app.ve.components[name]) app.throw('Component name already registered: ' + name);

		app.ve.components[name] = View.extend(configure);
		return app.ve.components[name];
	};

})(_, jQuery, Application, Mustache);