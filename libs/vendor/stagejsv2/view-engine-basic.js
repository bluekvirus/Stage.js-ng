/**
 * Basic View Engine. (Using Mustache.js as templating engine)
 *
 * Plugins (to app)
 * ----------------
 * app.ve
 * app.ve._rendered
 * app.ve._components
 * app.ve.view
 * app.ve.component (name, configure) or ([deps], configure)
 * app.ve.get
 * app.ve.list
 * app.ve.inject
 * $(el).data('view')
 *
 *
 * Use of View
 * -----------
 * 1. new View({
 * 		template: name or <...>
 * 		[deps]: sub-components used in template < component="..." >
 * 		[init]: function(options, ready){...; ready();}
 * 		[$el]:
 * 		[data]:
 * 		[events]: '<e> <selector>': 'fn' or fn(e, exarg1, exarg2) {$(this), e.data.view}
 * 		[coop]: global events forwarding...
 * })
 * 2. view.render(data, [$el])
 * 3. view.on/($)trigger/once/off()
 * 4. view.teardown()
 * 5. View.extend({...})
 * 6. view.getComponentName()/getUID()/isInDOM()
 * 7. view.bind() TBI (two-way with binders in tpl)
 * 8. view.vm TBI (available after view.bind())
 *
 * 
 * View Properties
 * ---------------
 * 1. _name
 * 2. _uid
 * 3. _postman
 * 4. deps - sub-component names map e.g {Comp: true, Comp2: true}
 * 
 *
 * View Lifecycle and Events
 * -------------------------
 * init(options, ready) --> render(e) --> render(e) ... --> teardown(e)
 *
 * Note: There are only 2 life-cycle events: `render` and `teardown`.
 * Note: Don't forget to call ready() if overriding the default init().
 *
 *
 * Sub Components
 * --------------
 * If you defined view.deps and mark regions in your template like
 * <div component="..."></div>
 * It will be replaced by that component.
 *
 * To pre-load the dependency componments in amd mode, use app.ve.component([depA, depB], {configure}).
 * 
 * 
 * Ghost View
 * ----------
 * 1. only views with `$el` can be rendered on screen, otherwise an exception with be raised;
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
 * 1. If you use `app.coordinator.on` for co-op with other things in the application, make sure to clean the listener
 * up in the view's `teardown` event.
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
	app.ve = {_name: 'Basic', _tplSuffix: '.mst.html', _TemplateEngine: Mustache};

	//--------------------------------View class definition---------------------------------
	//.template, .$el, .data, init(options, cb) .render(data), .teardown(), .events, .once/on/off/trigger()
	
	//constructor (logic-free)
	var View = function(options){
		this._options = options || {};
		
		//optional (overriden upon instanciation)
		this.$el = this._options.el && $(this._options.el);
		this.$el = this._options.$el || this.$el;
		this.data = this._options.data || this.data;
		this.init = this._options.init || this._options.initialize || this.init;
		this.events = this._options.events || this.events;
		this.template = this._options.template || this.template;

		//give each instance a unique id
		this._uid = _.uniqueId(app.ve._name.toLowerCase() + '_');

		var that = this;
		//extension point: init() (so you can load remote resources)
		//add a ready() callback to init
		this.init(this._options, function(){
			//render it right away upon creation if we know $el
			if(that.$el) that.render();
		});
		//extension point: coop (so you can have global events forwarded to this view)
		this._postman = {};
		_.each(this.coop, function(ge){
			var self = this;
			self._postman[ge] = function(){
				if(self.isInDOM()){
					var args = _.toArray(arguments);
					args.unshift(ge);
					self.trigger.apply(self, args);
				}
				else {
					if(app.ve._rendered[self.getUID]){
						app.coordinator.off(ge, self._postman[ge]);
					}
				}
			};
			app.coordinator.on(ge, self._postman[ge]);
		}, this);
		
	};
	//member methods
	_.extend(View.prototype, {
		init: function(options, ready){
			ready();
		},

		render: function(data, $el){

			//check the template first!
			if(!this.template) app.throw(this.getComponentName() + ' requires a template!');
			var tpl = app.templates[this.template] || app.templates[this.template + app.ve._tplSuffix] || this.template;
			
			//sanitize params
			if(data instanceof jQuery){
				$el = data;
				data = undefined;
			}

			//guard the $el that we about to render on, forbid swapping $el upon render.
			if($el){
				if(!this.$el)
					this.$el = $el;
				else if(this.$el[0] !== $el[0])
					app.throw(this.getComponentName() + ' instance already rendered at ' + this.$el[0]);
			}
			if(!this.$el)
				app.throw('You must have a valid DOM el for ' + this.getComponentName() + ' to render()...');

			//always merge new data instead of replacing completely, use view.data = data to do that.
			if(data)
				this.data = _.merge(this.data || {}, data);
			var content = app.ve._TemplateEngine.render(tpl, this.data);

			//teardown previous view if template is different.
			var meta = this.$el.data();
			if(!meta) app.throw('Invalid $el upon ' + this.getComponentName() + '.render(), check your el selector...');
			if(meta.view && (meta.view.template !== this.template))
				meta.view.teardown();

			//render 
			this.$el.html(content);
			//render sub components
			var that = this;
			if(this.deps)
				this.$el.find('[component]').each(function(i, el){
					var $el = $(this);
					var name = $el.attr('component');
					var Comp = app.ve.get(name);
					if(that.deps[Comp.prototype._name]) {
						new Comp({el: el});
					}
				});
			this.$el.data('view', this);
			//re-render but not registering the listeners again.
			if(!this.$el.data('_events_')) {
				//format <e> <selectors>, instead of <e1> <e2> ...
				_.each(this.events, function(fn, namenselector){
					if(_.isString(fn)) fn = this[fn];
					var tmp = _.compact(namenselector.split(' '));
					name = tmp.shift();
					if(_.size(tmp))
						this.$el.on(name, tmp.join(' '), {view: this.$el.data('view')}, fn);
					else
						this.$el.on(name, {view: this.$el.data('view')}, fn);
				}, this);
				
				this.$el.data('_events_', true);
			}

			app.ve._rendered[this._uid] = this.$el;
			this.trigger('render');
			return this;
		},

		teardown: function(){
			if(this.$el){
				this.$el.removeData('_events_', 'view');
				this.$el.empty();
				this.trigger('teardown');
				this.off();

				//cleanup related registry. (global events forwarding & rendered instances)
				_.each(this._postman, function(fn, ge){
					app.coordinator.off(ge, fn);
				});
				delete app.ve._rendered[this._uid];
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

		//allows both (e, [ extraparams array/object]) and (e, extraparam1, extraparam2, ...)
		trigger: function(){
			if(this.$el) {
				var args = arguments;
				//since $.triggerHandler only accepts (e, [...])
				if(arguments.length > 2) {
					var tmp = _.toArray(arguments);
					args = new Array(tmp.shift(), tmp);
				}
				//note that we use triggerHandler instead of trigger to avoid custom event bubbling
				this.$el.triggerHandler.apply(this.$el, args);
			}
		},

		//allows both (e, [ extraparams array/object]) and (e, extraparam1, extraparam2, ...)
		$trigger: function(){
			if(this.$el) {
				var args = arguments;
				//since $.trigger only accepts (e, [...])
				if(arguments.length > 2) {
					var tmp = _.toArray(arguments);
					args = new Array(tmp.shift(), tmp);
				}
				//allow event bubbling
				this.$el.trigger.apply(this.$el, args);
			}
		},

		//utilities
		getComponentName: function(){
			return this._name || '_Anonymous_';
		},

		getUID: function(){
			return this._uid;
		},

		isInDOM: function(){
			if(!this.$el) return false;
			return $.contains(document.documentElement, this.$el[0]);
		}
	});
	//static methods
	_.extend(View, {
		//class inheritance
		extend: function(configure, statics){
			var A = this.prototype.constructor;

			var B = function(){
				A.apply(this, arguments); //instead of A.call(this, arg1, arg2, ...)
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
	//convert templates into components (support: non-amd development)
	//use app.ve.component('<same name>', {+listeners}) later to extend view definition.
	app.coordinator.on('app.load', function(){

		_.each(app.templates, function(tpl, filename){
			var name = app.tplNameToCompName(filename, app.ve._tplSuffix);
			app.ve.component(name, {
				template: filename
			});

			app.debug('component registered:', name);
		});

		app.coordinator.trigger('app.loaded');
	});
	
	//----------------apis enhancement to app-------------------------
	//view instance cache (might not be accurate for nested components)
	app.ve._rendered = {};

	//return a quick view instance
	app.ve.view = function(options){
		return new View(options);
	};

	//view definition registry
	app.ve._components = {};
	//view definition lookup
	app.ve.get = function(nameOrPath){
		return app.ve._components[nameOrPath] || app.ve._components[app.tplNameToCompName(nameOrPath, app.ve._tplSuffix)];
	};
	app.ve.list = function(){
		return _.keys(app.ve._components);
	};

	//defines a view blueprint (support: both static and amd development)
	app.ve.component = function(name, configure){

		//amd mode, [deps] + configure (register upon inject)
		if(_.isArray(name) || !configure){
			if(app.isAMDEnabled()){
				if(_.isArray(name)){
					return define(_.extend(configure, {
						deps: name //delay injection of sub components till app.ve.inject... (tech constrain: amd.define())
					}));
				}else {
					return define.apply(define, arguments);
				}
			}
			app.throw('Non-amd mode or Malformed view definition...');
		}

		//static mode, name + configure (performance: using _components directly)
		if(app.ve._components[name]) {
			//override 
			app.ve._components[name] = app.ve._components[name].extend(configure);
		} else
			//register
			app.ve._components[name] = View.extend(_.extend({_name: name}, configure));
		return app.ve._components[name];

	};

	//dynamically inject js + html to register a View or multiple View(s) (support: amd development)
	//['path1', 'path2'] or just 'path' to load path.js & path.tpl.html to be combined into view definition.
	//use path:static to just load path.tpl.html as component.
	//use {path: ..., tplOnly: ..., forceName: ..., baseURL: ...} as 'path' for total control.
	app.ve.inject = function (options, cb){
		if(_.isArray(options)){
			app.coordinator.async.map(options, _inject, cb);
		} else {
			_inject(options, cb);
		}
	};
		//internal worker for ve.inject (single target, cb(err, result))
		function _inject (options, cb){
			if(!app.isAMDEnabled()) app.throw('AMD is not enabled, use task:amd before ve.inject()');
			if(_.isString(options))
				options = {path: options};
			if(_.isFunction(options)){
				cb = options;
				options = {};
			}
			options = _.extend({
				baseURL: app.amd.commonRoot,
				tplOnly: false,
				forceName: ''
			}, options);
			//allow :static in option.path to indicate tplOnly
			if(_.endsWith(options.path, ':static')){
				options.tplOnly = true;
				options.path = options.path.replace(/:static$/, '');
			}
			var compName = options.forceName?options.forceName:app.tplNameToCompName(options.path);
			if(!app.param('debug') && app.ve.get(compName)) return;//components cache hit

			var tplTarget = _.endsWith(options.path, '/')?[options.baseURL, options.path, 'index', app.ve._tplSuffix].join(''):[options.baseURL, options.path, app.ve._tplSuffix].join(''),
			jsTarget = tplTarget.replace(app.ve._tplSuffix, '');
			var targets = ['text!' + tplTarget];
			if(!options.tplOnly) targets.push(jsTarget);
			//don't use define here... the cb will never get invoked. (until what's define()-ed gets required)
			require(targets, function(tpl, js){
				js = js || {};
				//as success cb
				if(js.deps)
					//recursively inject the sub components
					app.ve.inject(js.deps, function(err, Comps){
						if(err) cb(err);
						else {
							Comps.push(
								app.ve.component(compName, _.extend(js, {
									template: tpl,
									deps: _.reduce(Comps, function(deps, Comp){
										deps[Comp.prototype._name] = true;
										return deps;
									}, {})
								}))
							);
							cb(null, Comps);
						}
					});
				else
					cb(null, app.ve.component(compName, _.extend(js, {template: tpl})));
			}, cb);//as error cb
		}

})(_, jQuery, Application, Mustache);