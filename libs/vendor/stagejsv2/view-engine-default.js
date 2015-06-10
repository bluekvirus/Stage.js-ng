/**
 * Basic View Engine. (Using Handlebars.js as templating engine)
 *
 * Plugins (to app)
 * ----------------
 * app.ve
 * app.ve._rendered -- {uid: $el, uid2: $el2, ...}
 * app.ve._components -- {name: Class, name2: Class2, ...}
 * app.ve.view -- (configure) => instance
 * app.ve.component -- (name, configure) or ([deps], configure)
 * 						  	| manual View.deps;    | auto View.deps;
 * app.ve.get -- (name or path) => Class
 * app.ve.list => [names]
 * app.ve.inject -- (path or [paths], cb(err, Class or [Classes]))
 * $(el).view(true) -- shortcut for getting the view in $el (use $el.data('view') internally)
 *
 *
 * Use of View
 * -----------
 * 1. new View({
 * 		template: name or <...>
 * 		[deps]: sub-components used in template < component="..." > (path or name)
 * 		[init]: function(options, ready){...; ready();}
 * 		[$el]:
 * 		[data]:
 * 		[events]: '<e>[ <selector>]': 'fn' or fn(e, exarg1, exarg2), e.data.view is self.
 * 		[coop]: global events forwarding...
 * 		[bindings]: whether to turn on MVVM after rendering or not
 * 					(available bindings in template: http://docs.telerik.com/kendo-ui/framework/mvvm/bindings/)
 * })
 * 2. view.render(data, [$el])
 * 3. view.on/($)trigger/once/off()
 * 4. view.teardown()
 * 5. View.extend({...})
 * 6. view.getComponentName()/getUID()/isRendered(inDomFlag)/[createVM()]
 *
 * 
 * View Properties (hidden/non-config)
 * ----------------------------------
 * 1. _name
 * 2. _uid
 * 3. _postman
 * 4. deps - sub-component [names/paths], will turn into {Comp: [], Comp2: []} after resolve.
 * 5. vm - the .data turned view-model in a `bindings` enabled view, with change event forwarded to view as 'vm:change'
 * 		|.set(path, val)
 * 		|.get(path)
 * 		|.toJSON() - a JS object instead of JSON string.
 * 		|.snapshot() - sync .vm state to .data
 *
 * Note that `vm:change` contains e.field for object or e.action/index/items/field for array.
 * Note that before `render` .vm will NOT be available. (you can NOT use this.vm.bind() in init()!)
 * 
 *
 * View Lifecycle and Events
 * -------------------------
 * [init(ready())] --> render(e) --> render(e) ... --> teardown(e)
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
 * 3. views with or without `$el` can all register event listeners, but they will only be activated upon render;
 * 4. rendering same view again and again will not re-register the listeners;
 * 5. rendering a new view on a `$el` will `.teardown()` the previous view if component names are different;
 * 6. `.teardown()` will not `$.remove()` a view's `$el`, but `$.empty()` it and remove all the event listeners;
 *
 * Ghost View will NOT happen in this implementation since jQuery removes data and event handlers from child
 * elements during `$.empty()`. If you render parent `$el` with a new view, child views will be removed properly
 * given that we bind everything on the `$el` through jQuery, and take extra care to teardown the sub components
 * introduced by view.deps.
 *
 *
 * Gotcha
 * ------
 * 1. there are no `on<event>` shortcut functions for listeners in a view. use `.on`/`.once` and `options.events` to 
 * register them instead.
 * 2. e.data.view is automatically available to listeners registered with the `.events` block and on/once functions;
 * 3. view.deps will be automatically populated in amd mode only by defining through ve.component([..deps..], {}).
 * 4. use `.vm.set()` to update `bindings` enabled view instead of re-rendering it. Note that this will NOT sync `.vm` with `.data`;
 * 5. when in doubt, read through .render() and .isRendered() again. Try not to re-use a view instance without tear it down first;
 * 
 *
 * Hardcode
 * --------
 * 1. templates must be named `*.hbs.html`
 *
 *
 * @author Tim Lauv <bluekvirus@gmail.com>
 * @created 2015.04.27
 */
(function(_, $, app, Handlebars, createVM, bindVVM){
	app.ve = {_name: 'Basic', _tplSuffix: '.hbs.html', _TemplateEngine: Handlebars};
	app._cache.compiledtpls = {};

	//--------------------------------View class definition---------------------------------
	//.template, .$el, .data, init(cb) .render(data), .teardown(), .events, .once/on/off/trigger()
	
	//constructor (logic-free, define INSTANCE variables)
	var View = function(options){
		this._options = options || {};
		
		//optional (overriden upon instanciation)
		this.$el = this._options.el && $(this._options.el);
		this.$el = this._options.$el || this.$el;
		this.data = this._options.data || this.data;
		this.init = this._options.init || this._options.initialize || this.init;
		this.events = this._options.events || this.events;
		this.template = this._options.template || this.template;
		this.bindings = this._options.bindings || this.bindings; //MVVM support upon render

		//internal
		var self = this;
		var id = _.uniqueId();
		this._uid = 'view-' + id; //give each instance a unique id
		this._name = this._name || [app.ve._name, '_Anonymous_', id].join(''); //fixed class/component name
		//failovers
		this._listenerBuffs = {once:[], on:[]}; //listener cache before given $el
		this._coopevBuffs = []; //coop events cache for replay
		//extension point: coop (so you can have global events forwarded to this view)
		this._postman = {};
		_.each(this.coop, function(ge){
			var self = this;
			self._postman[ge] = function(){
				//in DOM or haven't been rendered (loading data in init()...)
				if(self.isRendered(true) || !self.isRendered()){
					var args = _.toArray(arguments);
					args.unshift(ge);
					self.trigger.apply(self, args);
				}
				//not in DOM and has been rendered before, clean it up
				else {
					app.coordinator.off(ge, self._postman[ge]);
				}
			};
			app.coordinator.on(ge, self._postman[ge]);
		}, this);

		//setup external init flag
		if(_.isFunction(this.init))
			this._initialized = false;//not until init() is called
		else
			this._initialized = true;

		//if we already know the $el, render it right away, will revisit init() along the way.
		if(this.$el) this.render();
		
	};
	//member methods only (no GLOBALLY shared state variables please!)
	_.extend(View.prototype, {
		init: undefined,

		render: function(data, $el){
			var self = this;

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

			//check if this instance has been fully initialized, call init(ready()) if not.
			if(!this._initialized){
				return this.init(function(){
					self._initialized = true;
					self.render(data, $el);
				});
			}

			//always merge new data instead of replacing completely, use view.data = data for a complete reset.
			if(data)
				this.data = _.merge(this.data || {}, data);

			//check and fetch the compiled template cache.
			var tplfn = app._cache.compiledtpls[this.getComponentName()] || app.ve._TemplateEngine.compile(tpl);
			if(!app.notplcache) app._cache.compiledtpls[this.getComponentName()] = tplfn;
			//combine data + tpl into html
			var content = tplfn(this.data);

			//teardown previous view if template is different.
			var meta = this.$el.data();
			if(!meta) app.throw('Invalid $el upon ' + this.getComponentName() + '.render(), check your el selector...');
			if(meta.view && (meta.view.getComponentName() !== this.getComponentName()))
				meta.view.teardown();

			//render 
			this.$el.html(content);
			this._el0 = this.$el.children()[0];//used later in isRendered(isInDOM)
			app.ve._rendered[this._uid] = this.$el; //used later in isRendered()
			//render sub components
			if(this.deps){
				//non-amd: auto fill this.deps (since ve.component([deps]) in this mode won't prep that.)
				if(_.isArray(this.deps))
					this.deps = _.reduce(this.deps, function(resolved, np){
						resolved[app.tplNameToCompName(np)] = [];
						return resolved;
					}, {});
				this.$el.find('[component]').each(function(i, el){
					var $el = $(this);
					var name = $el.attr('component');
					var Comp = app.ve.get(name);
					if(self.deps[Comp.prototype._name]) {
						var subcomp = new Comp();
						subcomp.once('render', function(e){
							//remember the uid of this sub component instance. (for teardown())
							var v = e.data.view;
							self.deps[v.getComponentName()].push(v.getUID());
						}).render($el);
					}
				});
			}
			this.$el.data('view', this);

			//register events
			//re-render will not registering the listeners again.
			if(!this.$el.data('_events_')) {
				//format <e> <selectors>, instead of <e1> <e2> ...
				_.each(this.events, function(fn, namenselector){
					if(_.isString(fn)) fn = this[fn];
					var tmp = _.compact(namenselector.split(' '));
					name = tmp.shift();
					if(_.size(tmp))
						this.on(name, tmp.join(' '), fn);
					else
						this.on(name, fn);
				}, this);

				//add cached listeners from before (without a $el)
				_.each(this._listenerBuffs, function(list, type){
					_.each(list, function(args){
						this[type].apply(this, args);
					}, this);
				}, this);

				this.$el.data('_events_', true);

			}

			//bind the viewmodel if required. (after template rendering)
			if(this.bindings){
				//cleanup previousely bound vm every time. (so try NOT to rerender with bindings enabled)
				if(this.vm) this.vm.unbind();
				//create and bind new vm
				this.vm = _.extend((this.createVM && this.createVM(this.data)) || this._createVM(this.data),{
					//provide a way to sync .vm into .data, like taking a snapshot of state.
					snapshot: function(){
						self.data = this.toJSON();//note that vm.toJSON() will return a JS object.
						return self.data;
					}
				});
				bindVVM(this.$el, this.vm);
				//forward the change event
				this.vm.bind('change', function(e){
					self.trigger('vm:change', e);
				});
			}

			this.trigger('render');

			//replay all cached co-op events (disable: clear this._coopevBuffs in `render` listener.)
			while(this._coopevBuffs.length){
				var args = this._coopevBuffs.shift();
				this.trigger.apply(this, args);
			}

			return this;
		},

		teardown: function(){
			if(this.isRendered(true)){

				//cleanup global events forwarding registry.
				_.each(this._postman, function(fn, ge){
					app.coordinator.off(ge, fn);
				});
				//cleanup sub component instances.
				_.each(this.deps, function(subcompuids){
					_.each(subcompuids, function(uid){
						var tmp = app.ve._rendered[uid];
						if(tmp) tmp = tmp.data('view');
						if(tmp) tmp.teardown();
					});
				});

				//cleanup self
				if(this.vm) this.vm.unbind();
				this.$el.removeData('_events_', 'view');
				this.$el.empty();
				this.trigger('teardown');
				this.off();
				//remove self from instance registery.
				delete app.ve._rendered[this._uid];
				//unlock $el (the teardowned view can be rendered on other $el again...0.0)
				this.$el = undefined;
			}
		},

		//manual registration support for instance events, .once, .on
		once: function(){
			var args = this._guardEveListenerArgs('once', arguments);

			if(this.isRendered()) {
				this.$el.one.apply(this.$el, args);
				this.$el.data('_events_', true);
			}
			else 
				this._listenerBuffs.once.push(args);
			return this;
		},

		on: function(){
			var args = this._guardEveListenerArgs('on', arguments);

			if(this.isRendered()) {
				this.$el.on.apply(this.$el, args);
				this.$el.data('_events_', true);
			}
			else
				this._listenerBuffs.on.push(args);
			return this;
		},

		//event listener clean up
		off: function(){
			if(this.isRendered(true)) {
				this.$el.off.apply(this.$el, arguments);
			}
			return this;
		},

		//allows both (e, [ extraparams array/object]) and (e, extraparam1, extraparam2, ...)
		//with coop events cache support.
		trigger: function(){
			if(this.isRendered()) {
				var args = arguments;
				//since $.triggerHandler only accepts (e, [...])
				if(arguments.length > 2) {
					var tmp = _.toArray(arguments);
					args = new Array(tmp.shift(), tmp);
				}
				//note that we use triggerHandler instead of trigger to avoid custom event bubbling
				this.$el.triggerHandler.apply(this.$el, args);
			}else {
				this._coopevBuffs.push(arguments);
			}
			return this;
		},

		//allows both (e, [ extraparams array/object]) and (e, extraparam1, extraparam2, ...)
		//withOUT coop events cache support.
		$trigger: function(){
			if(this.isRendered()) {
				var args = arguments;
				//since $.trigger only accepts (e, [...])
				if(arguments.length > 2) {
					var tmp = _.toArray(arguments);
					args = new Array(tmp.shift(), tmp);
				}
				//allow event bubbling
				this.$el.trigger.apply(this.$el, args);
			}
			return this;
		},

		//utilities
		getComponentName: function(){
			return this._name;
		},

		getUID: function(){
			return this._uid;
		},

		//Note: $el is the parent element the view attach to, the content is the view template.
		//Note: isRendered != isInDOM
		//Note: isRendered() will be truthy before the `render` event gets triggered (so that its listeners can be registered)
		isRendered: function(isInDOM){
			if(!this.$el) return false;
			if(isInDOM)
				return $.contains(document.documentElement, this._el0);
			return app.ve._rendered[this.getUID()]? true : false;
		},

		//fix and inject {view: self} into all event listener args as e.data.view.
		_guardEveListenerArgs: function(type, args){
			args = _.toArray(args);
			if(!args || args.length < 2) app.throw('Malformed '+ type +' event listener registration...');

			var self = this;
			switch(args.length){
				case 2:
					args.splice(1, 0, {view: self});
				break;
				case 3:
					var tmp = args.splice(1, 1);
					if(_.isString(tmp)){
						args.splice(1, 0, {view: self});
						args.splice(1, 0, tmp);
					}else 
						args.splice(1, 0, _.extend(tmp, {view: self}));
				break;
				case 4:
					args.splice(2, 1, _.extend(args[2], {view: self}));
				break;
				default:
				break;
			}

			return args;
		},

		//in case you want to create customized .createVM(), with the help of global default createVM()
		_createVM: createVM,
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

	//------------------------jQuery plugin----------------------------
	//shortcut of getting view instance per $el. 
	//Note: use `$el.view(true)` to get all views returned as non-.
	$.fn.view = function(extract){
		var views = this.map(function(){
			return $(this).data('view');
		});

		if(!extract)
			return views; //use .get() afterward
		else {
			switch(views.length){
				case 1:
				return views.get(0);
				default:
				return views.get();
			}
		}
	};

	//-----------------hooks into app infrastructure-------------------
	//convert templates into components (support: non-amd development)
	//use app.ve.component('<same name>', {+listeners}) later to extend view definition.
	app.coordinator.on('app:load', function(){

		_.each(app.templates, function(tpl, filename){
			var name = app.tplNameToCompName(filename, app.ve._tplSuffix);
			app.ve.component(name, {
				template: filename
			});

			app.debug('component registered:', name);
		});

		app.coordinator.trigger('app:loaded');
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

		if(!configure) {
			configure = name;
			name = null;
		}
		if(!configure) app.throw('Malformed Component definition...');

		if(_.isArray(name)) {
			configure.deps = name;
			name = null;
		}

		//amd mode, [deps] + configure (register upon inject)
		if(!name && app.isAMD()){
			return define(configure);
		}

		//both in static & amd mode, name + configure (performance: using _components directly)
		name = name || configure.suggestedName;
		if(!name) {
			app.throw('You must give a suggestedName when define a Component...');
		}

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

			if(_.isString(options))
				options = {path: options};
			if(_.isFunction(options)){
				app.throw('You must reveal the path to your component...');
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
			//check components cache first
			var cached = app.ve.get(compName);
			if(cached) return cb(null, cached);
			else if(!app.isAMD()) cb(new Error('Component Not Found: ' + compName));
			
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
										deps[Comp.prototype._name] = [];//instance uids
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

})(_, jQuery, Application, Handlebars, kendo.observable, kendo.bind);
