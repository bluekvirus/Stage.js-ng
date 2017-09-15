Change Log
==========

1.10.3+ (2017-08*)
------------------
1. labels/tooltips/help/status for editors and editor data options can now use raw html within them; (e.g using `<i>` icon tags together with texts) 
2. app.preventDefault(e) now allows `<label>` tag default behavior to pass to browser;
3. Added `options.extract` to select/radios/checkboxes editors for finer control over remotely fetched choices;
4. Replaced app.dispatcher/reactor with app.ee(state, e-map);
5. Added app.until api for aligning on async events among a array of targets;
6. Refined view.show() to return the sub-regional view obj instead of region obj; (affecting the returned obj for app.spray as well)
7. Refined app.spray() to honor [region="..."] names in template upon creating new regions;
8. Replaced view.poll configure with view.pollings; (renamed)
9. Removed 'view:all-region-shown' event in favor of 'ready'; (all sub region 'ready' synchronized and waited upon, except for navRegion)
10. Removed 'ready' event on `$.val()` powered editors;
11. Refined svg canvas drawing to happen before 'ready'; (only 'navigate-to', pollings and channels setup happens after 'ready')
12. Refined DataGrid widget to dynamically load its header and body cells; (just like form view editors)
13. Refined 'view:before-navigate-to' meta event to have the sub-path array as argument;
14. Aligned coop e 'navigation-changed' to be after last-view-in-the-chain's ('ready' -->) 'view:navigate-to' (--> 'navigation-changed');
15. Fixed view.tab() tab region modification timing issue caused by hidden container view (fake async 'data-rendered');
16. Aligned 'view:tab-activated' to be after newly added tab view's 'ready' event;
17. Fixed app.icing/curtain api and configure regression due to region construction timing change; (app.icing/curtain can now show views directly)
18. Added more default event forwarding to view.dnd ability; (drag-start/stop, drop-over, select-start/stop)
19. Ensured both no-data and empty-data view's initial ready event by the faked 'data-rendered' event;
20. SVG papers will be drawn after 'view:data-rendered' but always before 'ready';
21. Ensured 'view:navigate-to' to be always triggered after 'ready' not just once; (so you can refresh views in mid nav-chain with new data)
22. Added 'display:inline-block;' to themeprep-ed 'img.less' file entries automatically;
23. Aligned 'view:navigate-away' to be upon 'close'; (just as an alias to 'close' but making more sense in our 'nav-chain' terms)
24. Added app.ee with ['a-->b', 'c-->d'] state machine support;
25. Fixed 'this.options.row.grid' ref in header/body cell views in Datagrid widget;
26. Aligned all 'this._options' back to 'this.options' in widgets impl;
27. Refined app.Util.Tpl.build() to build local templates without adding to html header;
28. Added .get()/.has()/.clear() to app.Util.Tpl for template cache access;
29. Added transitionend events to app.ADE for animation and transition sync on $el;
30. Refined view.layout template caching efficiency;
31. Remote empty templates now all have default ' ' (1 space) instead of being blank; (this is to kill extra reloading of remote templates)
32. Re-register a View definition will now correctly refresh its template cache;
33. Added $.fn.anyone() plugin to jQuery for listening on app.ADE (animation/transition end) events;
34. Added model.reset() to stand-alone models, same as using view.set({reset: true});
35. Added .svg icon support in `stagejs theme` cmd; (auto pickup and merge into icon font);
36. Added new editor type: code;
37. Added stage-unideck integration;
38. Removed app.config.fullScreen option;
39. Added app.config.svg/pollings/channels options;
40. Replaced 'window-scroll' with 'viewport-scroll' global coop; (based on 'region-app' now)
41. Added pre/postfix buttons/icons to input (text, password) editor;
42. Added app.mock(); (default provider faker.js)
43. Refined app.poll() to be eagerly working upon 1st call;
44. Added app.worker() WebWorker support;
45. Added app.sse() Server-Sent-Event support;
46. Single svg view will now assume drawing in onReady() and have 'view:window-resized' event auto-wired to trigger 'ready' again;
47. Refined app.locate() and related debug apis to support multiple view targets with the same name;
48. Added app.detect() api for browser feature detections;
49. 'region-app' will now be automatically prepended into `<body>`;
50. Added app.pack(); (opposite to app.extract, set val to obj by 'dotted.path.key')
51. Removed _id (use id instead), _method, _entity in app.remote() call options;
52. Refined payload.id in app.remote() options to affect only query params;
53. Added app.config.jwttoken to honor JSON Web Token in app.remote();
54. Removed .headers in app.remote() options.xdomain, use options.headers directly instead;
55. Added app param ?mock=true support to intercept app.mock() registered urls in app.remote();
56. Added secured websocket support (wss://) in channels;
57. Fixed app.remote() url query params merging error;

working on ...

* docs folder through app.widget('ToC') or ('Tree');
* merge lock into action="(name/onMetaEvent):lock topic"; (wait on named actions which return promises)
* merge svg="", widget="", editor="" with view="" and reconfigure="key in view's model";
* add tabs="" with tab="", list="" and remove activate="";
* app.prompt() + $.fn.underlay();
* view.sses/topics wiring with app.sse(); (align pollings/channels/topics)
* view.submit(url, editors[data, files]) in addition to app.upload(); (align both standalone and normal file editors upload with same auto csrf token inject?)
* make view.template implicit; (component based view folders, default on Main view)
* separate config js to use for both app and build; (remove Main view properties from app config)
* make tests public and collaborable;
* breaking down 'Basic' editors;
* view.markers{m1: {'e': fn/fnName/coopE}, ...}; ([m1=...], do/prep upon 'e')
* remove jQueryv2/3.0 and Marionettev1.8 deps and related code;


1.10.2 (2017-04-21)
-------------------
1. Refined render() seq in a view, data change will now always re-run render() despite of category;
2. Refined SVG canvas init code in view, the .svg option can be a css selector string now;
3. Editors now share data model with template, view.get() will now smartly get both types (normal, form) of data with an optional dotted keypath, editor.set/get() as an alias to editor.set/getVal().
4. Refined view.paper.clear(), it can now take additional sizing argurments (w, h);
5. Added flat and useFlatModel flags to app.model() and views respectively;
6. Added `replace` (flag/level) option to view.set() for finer model data replace/merge control, alias `override`;
7. Added View.create() chaining method for all Views (both named and anonymous);
8. Fixed .className value error if a view specifies its own as a function;
9. Added support to skip appending editors by saying `_global.appendTo = false`;
10. Added multiple svg support in one view with .svg: {name: fn, ...,} and svg="name" tag attribute; (no need to call paper.clear() in fn) 
11. Added app/view.spray($anchor, View/draw(paper){}, options, parentCt);
12. Added view.getViewFromTab(tabId) to view after using view.tab(); 
13. Added 'view:paper-cleared' event to svg papers;
14. Refined paper._fit() with fit to $anchor ability;
15. Refined view.show()/'region:load-view' to allow anonymous view options;
16. All views now starts with 'window-resized' coop by default if view.coop is not set to false;
17. Added _.isjQueryObject() util function;
18. Added _.deepClone*() util functions;
19. Added M/view.triggerMethodInversed() to always call onE() before all the 'e' on()s;
20. Aligned 'view:navigate-to' to be always after 1st 'view:ready' instead of 'region:show', also (only) your onReady() will always be called before onNavigateTo();
21. Aligned view 'navigate-chain' listener and context swapping code in app.onNavigate(); 
22. Used of .layout now support dynamic html tpl in regions;
23. Added view.getTemplate(asHTMLTxt) for getting any tpl as a resolved HTML string;
24. Added support for special html str as nested tpl id in view.layout;
25. Added d3.js (v4) support as paper.d3 in svg draw functions if present;
26. Refined svg support code to make Raphaël.js/Snap.svg and D3.js both optional;
27. Refined view coop implementation (simplified);
28. Exposed region.parentCt (through .ensureEl(view)) as parent view for any region;
29. Added region.$el.data('region') to point to itself, just like a view;
30. Refined region.ensureEl() method to take care of all the region metadata; 
31. Icings/Curtains not bind as regions in app.mainView instead of app itself;
32. view.more() now correctly attaches .parentRegion to the item views;
33. Added view.poll option with app.config.dataPollingDelay for hooking up auto remote data pulling;
34. Refined app.coop(e, ...), it now takes arbitrary arguments after e;
35. Added view.channels option with 'view:channel-hooked' meta event;
36. Improved view 'ready' timing (deferred) when given no data, {}/[] empty data or locally available data; 
37. Added app.upload() api for direct file upload without editor (default fieldname = files);
38. Added fallback/override options to app.get(name, type, options);
39. Refined flexlayout created regions's sub-view height/position;
40. Refined app.throttle/debounce implementation (+fn cacheId);
41. Fixed template cache clean-up upon app.get() View override;
42. Added options.reset to view.set() to clear model before setting new data;
43. Added default val to view.get('key', default);
44. Add Canvas playground context in addition to Mockups;
45. Refined [region=/view=] pickup timing to be after show/data-rendered to allow dynamic region/view assignments by data;
46. File editors now have options.name as their default fieldname upon file upload (instead of a random uuid);
47. Added SVG drawing (canvas creation, gradient filling, resizing) compatibility layer in `paper` objects;
48. Added options.multiple to file editor;
49. 'action=' tags will no longer hold back inner `<input>, <select>, <textarea>, <a href="...">` tag default e;
50. Replaced app.config.websockets with app.config.defaultWebsocket;
51. Added Django ASGI JSON Websocket Demultiplexer support in view.channels;
52. Added support to use auto reconnecting websockets; (with `path+`)
53. Fixed csrf token auto injection error for file upload editors;
54. Refined DataGrid widget implementation to honor refined view life-cycle; 
55. Refined view.more() api implementation when presenting with the replace flag;
56. Refined html processing to add `src=`/`href=` timestamps (?_=...) for cracking client/proxy caches for built projects;
57. view.activate() will by default trigger `view:item-activated` event instead of being silent;
58. Added 'navigation-changed' coop event in place of 'context-switched';
59. Added app.navPathArray() api to obtain current navigation path partials as an array;
60. app.markdown() now support `headerPrefix` as a function in its options;
61. Upgraded to jQuery 2.2, rapheal 2.2 and flexlayout 0.3;


1.10.1 (2017-02-04)
--------------------
1. Popover view close will now cause popover to close in addition to by bond view close;
2. Added CSRF token support with cookie name and Ajax header name in app.setup();
3. App mainView now honor template/layout in the right seq as other View objects; (template > layout)
4. Aligned `app:mainview-ready` event timing to be exact upon mainView ready;
5. All action="" tagged elements will now have e.preventDefault() by default;
6. Fixed clean-up issue if $anchor missing when view used as popover;
7. view.isInDOM() can now take 1 optional argument as the target $el instead of this.$el;
8. Fixed infinite loading error if script path didn't match defined view name inside it;
9. Removed Swag helpers from libs;
10. Fixed getVal()/setVal() default impl when view used as editor; 
11. Initial api spec v1 collected and put into doc;


1.10.0 (2016-12-31)
--------------------
1. Missing locale file will no longer raise exceptions;
2. Updated flexlayout to be 0.2.3;
3. Added view:ready event for all type of views (static/svg, data, form);
4. Added {options} object (like in app.remote) as `url` support to app.poll();
5. Added app.poll(false) to stop all polling;
6. Non-object ref-ed by `useParentData` will now be wrapped into object before assigning to this.data in a sub-view;
7. Added view.show('region', ...) as an alternative to `region:load-view`; 
8. Refined app.markdown() api to support 2 ways of getting options (direct, data-marked/hljs);
9. Remapped all app:blocked events to app:locked;
10. Added callout supporting symbol !!! in addition to ^^^ for markdowns;
11. Added `view="@*.md"` preprocessed markdown template support in addition to `view="@*.html"`;
12. app.debug() now returns the last argument while printing under `?debug=true`
13. Added `activate[-e]=group:classes` and `deactivate[-e]=group` supports for easy element activation by css classes;
14. Removed app.nextFrame() and app.cancelFrame() apis;
15. Aligned data push (ws-data-channel) and poll (poll-data-e) global coop event formats;
16. Registered View will now correctly adds category-name style class upon instantiation;
17. [ui=...] will now group all same-keyword marked elements instead of just one;
18. Added .parentCt property to .more()-ed item views;
19. this.close() now supports closing a specific region by ('name');
20. Aligned data-effect*= to effect*= for region animations; (this might break your templates)
21. Fixed a regression in app.mark(); (e.g editors, .more()-ed views);
22. Array typed data property in a View def will now be cloned before given to model.items;
23. .more()-ed views will now have correct parentRegion as well as parentCt;
24. Refined template building/caching code to support both view and view="" in the same way; (e.g *.md and '/' for app.config.viewTemplates bypass in remote path)
25. 'context-switched' global coop event will now emit with additional metadata as second param.
26. Added view.activate(group, filterFn) for programmatic (silent feedback) activations;
27. Added app.config.defaultView as an alias to app.config.defaultContext;
28. Added viewConfig to app.navigate({path:..., viewConfig:...}) as 2nd param to onNavigateTo();
29. Aligned local/remote data ready event timing; (both after this.paper ready)
30. Aligned navigate-to and ready event timing; (always be show-navito-ready for static, form, local/remote data views in a nav chain)
31. timeout option is given back to app.remote() for overridding default app.config.timeout;
32. Refined editor related meta-events mapping on parent (form) view;
33. Added 'show' and 'ready' events to editors; (internal, for editor writer only);
34. Added range editor;
35. Added date editor;
36. Added time editor;
37. Added progress bar to file editor;
38. Added view.tab('region', View, tabId) api, also tab-added/removed/activated events on views;
39. Added ?asfile= for mock apis to return download-able content;
40. Refined app.download() api arguments;
41. devserver now supports multiple root path per client base uri (auto fallback if root folder doesn't exist);
42. Upgraded LESS to v2 and supporting glob/batch @import;
43. Refined watcher mech in devserver;
44. Added dynamic polyfill (JS) to index.html;
45. Separated modernizr from deps;
46. Refined build mech,config and theme process;
47. Simplified framework project deps/dist management;
48. Enhanced bower dist package for project jump start without stage-devtools;


1.9.2 (2016-05-25)
------------------
1. Added .btn-pointy-right/left to base theme; (default size only)
2. Added .pointer-up/down/left/right and .relative-ct to base theme;
3. Added app.config.curtains as an alias to app.config.icings; 
4. Changed I18N.configure() to async I18N.init();
5. Changed app.inject.tpl also support async loading;
6. Refined app initializers to support fully async promise mode;
7. Refined view.popover() to honor position and style in options;
8. Added view.coop() for same-ancestor co-op;
9. Refined view.lock() to be able to lock itself in addition to regions;
10. Refined default websocket data path register and exposure; (+app:ws-data, +coop['ws-data-[channel]'])
11. Refined meta-event name-to-listener mapping rule; (app.Util)
12. Fixed show event out-of-sync issue with context during nav chaining;
13. Refined app.get() fallback strategy; (any --> view)
14. Moved $.split into separate repo as dep; (flexlayout)
15. Added ^^^class ... classN extension to app.markdown();
16. Removed restrictive api check on .overlay() and .popover();
17. Added app.curtain() as an alias to app.icing();
18. Added app.prompt();
19. Added app.poll(); (with later.js)
20. Added .data and .actions to app.config for mainView; (easy global data + bind for multi-page app)


1.9.1 (2016-03-10)
-------------------
1. Added favicon support mock in starter-kit index page;
2. Updated default mockups;
3. Added .btn.circle in base theme (also updated .circle mixin);
4. Updated export to include /channels and /profile;
5. Added navRegion chain cleanup;
6. Refined navRegion chaining (through region:show instead);
7. Reset grid col gaps evenly (added .row-extended);
8. Refined .wrapper class gaps;
9. Added app.notify and app.markdown apis;
10. Simplified devserver settings for watchers;
11. Added anonymous regions;
12. Added popover ability to view;
13. Added api-mock-json-404 middleware to dev-server;
14. Added full event types support to view actions (`action-[type]="fn name"`);
15. Removed md-content plugin in favor of app.markdown();
16. Removed json assumption in app.remote response dataType;
17. Refined app.mainView now will always have a contextRegion/navRegion region;
18. Added default 'no-template' template to non-form views;
19. Added 'view', 'viewName' metadata to view.$el and the app.locate api;
20. Added 'renderCount' metadata to view.$el and the app.profile api;
21. Added view.category metadata in addition to view.name (through reusable registry);
22. Added app.mark() api; (experimental);
23. Fixed region close effect (will honor view.effect now);
24. Refined [ui],[region] auto-pick performance after 1-render;
25. Removed view:animated event (1.8.4) use 'show' instead;
26. Added dnd support to views (drag, drop, sortable);
27. Added selectable item support to views (selectable);
28. Refined template caching (local-dom, remote and in-memory);
29. Added view recognition to app.reload();
30. Added app.throttle/debounce() apis to be used for action listeners;
31. Added app.animateItems() api;
32. Fixed mock json searching edge case: /name.json$/ --> name.mock.js;
33. Fixed _.isPlainObject() method;
34. Refined view.overlay/popover() anchor argument pick-up;
35. Merged the Context concept into View when using app.get(); (you can now use view as a context)
36. Added .callout to theme base;
37. Added .more() api to view; (need example: infinite scrolling)
38. Added .layout config to view and app.config;
39. Merged $.hsplit/vsplit to $.split
40. Refined $.overlay options (*content, *effect, +duration, +easing)
41. Added .lock() api to view;
42. Deprecated region.resize() api;
43. Added 'scroll-bottom/top' and fixed 'scroll/load/error' action events;
44. Added data-export script to tools (npm run data-export);
45. Refined svg support in view (Raphael/Snap.svg);
46. Added app.i18n() api for using global I18N functions;
47. Fixed build interference with the doc site sub-project;
48. Fixed [region="app"] sizing regression;
49. Added app.icing() api; (with app.config.icing)
50. Added region.show('template string') direct call;


1.8.7 (2015-12-07)
-------------------
1. Added $.hsplit/vsplit plugins (beta);
2. Aligned editor templates to handlbars v4;
3. Added 'view:editor-changed' event;
4. Added 'view:editors-updated' event;
5. Removed theme dependency on .fa;
6. Added app.animation() raw fx api;
7. Added 'window-resized' to global coop event;
8. Added icon-font powered checkboxs and radios;
9. Added hand-cursor & text-shadow to [action] tags;
10. Added 'window-scroll' to global coop event;
11. Added 'context-switched' to global coop event;
12. Fixed app.get() name recovery error;


1.8.6 (2015-11-18)
-------------------
1. Fixed dynamically loaded script position in build;
2. Aligned DEV:: and RUNTIME:: exception formats;
3. Refined params/querys option processing in app.remote;
4. Removed form/editor nesting through regions;
5. Added backbone-deep-model for 'x.y.z' change/get.
6. Flattened form editor <-> data mapping (deep key);
7. Added view.getViewIn('region') method;
8. Added app.dispatcher() api;
9. Disabled 'array.0.property' shredding in models;
10. Added app.nextFrame()/cancelFrame() apis;
11. Added jquery-color for color in $.animate();
12. Updated handlebars to v4 (mind the 'context' change);


1.8.5 (2015-10-08)
------------------
1. Fixed view.useParentData for using subset of parent data in child view.
2. Added backbone-deep-model for 'x.y.z' change/get.
3. view.data can now be specified in options when initialize a view.
4. Refined set()/refresh() implementation in views.
5. Non-form parent view data change will now correctly refresh regions.
6. app.remote now honor '/' & './' leading urls as they were (skipping app.config.baseAjaxURI).
7. Added app.param() for getting url query params;
8. Added app.debug() to replace console.log during development;
9. Added app.reload() to force an easy location.reload();
10. Auto view injection now supports editors;
11. Updated user router for default login/logout/touch apis;
12. Explicit about supported Basic editor types; (dynamically through Modernizr if H5)
13. Fixed theme prep tool font/icon params;
14. Updated themerep tool with icon resizing support;
15. Simplified devserver (-models, groups, +permissions);
16. Enhanced app.remote();
17. Enhanced server.mount() with custom URI;
18. Added soft realtime messaging support; (websocket & channels)


1.8.4 (2015-08-25)
-------------------
1. Added view:animated event for effect enabled view.
2. Dynamic view loading path now includes view category (devtool v0.2.2).
3. Refined view.data configure processing.
4. Refined view.set/refresh timing & conditions.


1.8.3 (2015-08-20)
-------------------
1. Added view:all-region-shown event.
2. Refined view.data configure load timing.
3. Added view.refresh method.
4. Refined one-way-bind criteria in view.set() & fully support form views.
5. app.config.theme is now deprecated.
6. view.data configure & view.refresh now fully support form views.
7. bower.json in all distributions are now in pretty-print format.
8. view.get() now fully supports form views.
9. Updated documentation.


1.8.2 (2015-08-16)
-------------------
1. Refined Reusable module method register().
2. Added _.isPlainObject() to underscore.
3. Back-ported global co-op e.
4. Added view.isInDOM() check.
5. Back-ported dynamic view injection (synced).
6. Added app.has/get apis.
7. Removed caching ability from $.md plugin.
8. Added app.extract for deep-key value extraction from any object.
9. Added app.cookie for quick cookie reading/writing.
10. Added app.validator for using validators.js
11. Removed jquery.transition. (leaving only jQ.fx and animate.css)
12. Added app.store for using store.js
13. Added app.uri for using URI.js
14. Added icon sprite & texture preview in theme-prep tool.
15. Added exit effect configure to region & view.
16. Now path and name can be used interchangeably when checking/getting/creating/altering any reusable view (but not registering).
17. Now css & less files in bower_components can be referenced directly.
18. The build process now fully supports dynamically injected scripts.
19. Added data config (string or obj), set()/get() shortcuts to views.
20. Deprecated view.type configure.
21. Updated documentation.


1.7.9 (2015-07-29)
-------------------
1. Refined $.ajaxEvents to app:ajax* events mapping.
2. Deprecated app.regional API.
3. Refined app.kickstart sequence. (app initializers can now call app.navigate)
4. Merged context and regionl into resuable.
5. Sharded infrastructure src.
6. Cleaned up code repository and monitored libs.
7. Updated documentation.


1.7.8 (2015-02-11)
------------------
1. Fixed i18n plugin bugs and refined view/editor/grid/tree auto support to i18n labels.
2. Auto detect browser locale in i18n process.
3. Added i18n locale config in app to be able to force on certain locale.
4. Stop creating '_ref' folder in the theme tool upon upgrading.
5. Removed yepnope from dependencies since Modernizr already has it.
6. Fixed 'data-rendered' event bug in Datagrid.
7. Fixed 'app:ajax*' event bugs.


1.7.7 (2014-12-08)
-------------------
1. Fixed app.remote() and fileupload timeout with app.config.timeout.
2. Refined page & window switching in Paginator widget.
3. 'disabled' css class on tag now correctly disable its actions and the child tag actions. 


1.7.6 (2014-12-01)
-------------------
1. Fixed editor label color mis-config in default theme less.
2. Added .segmented-control to base theme.
3. Fixed region layout attr 'data-overflow-y' recognition error.
4. Added _ref folder to theme after each theme regeneration, containing a copy of default theme less files for theme updating purposes.
5. Fixed theme watcher script in devserver.
6. Added page window size to the Paginator widget.
7. Added file upload handling to devserver. (through busboy)


1.7.5 (2014-11-17)
-------------------
1. Removed jQuery.Effect on region and views, use css animation name instead.
2. overflow settings on region contents for resize() now align with `data-attributes` format.
3. Default to silent navigation (no #hash) in Cordova/Phonegap dev/deployment.
4. Fixed bug in app.config.fullScreen where body.width gets left out.
5. Fixed watchers in devserver (replaced globwatcher with node-watch).
6. Added touchmove scroll-x fix (.scrollable).
7. Fixed .circle() less mixin;
8. Fixed app:resized event timing during app bootstrapping;
9. app.mainView can now be overridden during 'app:before-template-ready' event;
10. Ensured app.screenSize before app.start(); (available in all initializers)


1.7.4 (2014-11-13)
--------------------
1. Refined template-builder code to better support tpl injection/overridden.
2. @*.html, 'string', ['string', 'array'] tpls no longer have their tpl strings injected into `<head>`.
3. Splited the Application.inject func into 3 sub funcz (js, tpl, css).
4. Added version badges to README.md, HOWTO.md to replace static version texts and updated the docs.
5. Added effect data-attributes recognition to regions.
6. Fixed 'show' event missing problem in overlay enabled views. (with .triggerMethod())
7. Added server.model method to devserver for defining data entities for RESTful. (with basic session, basic crud)
8. Included validator-js in the deps for built-in validators support.
9. Fixed animate.css activation error in themes.
10. Included jquery.transit back into deps.
11. Added window.app as an alias to window.Application. (XDK compatible)
12. Added release/edge build tag into app.stagejs.
13. Fixed error in ro type editor enable/disable ops.
14. Fixed error in form view (item-view) setValues (allow 0, '' & false).
15. Added cordova watch to devserver watchers.
16. Added app.navigate() as alias to app.trigger('app:navigate', ...).


1.7.3 (2014-10-19)
-------------------
1. Refined $.md plugin and region.resize() with `_.defer()`.
2. app.Util.download <-> app.download.
3. Fixed bug in app.Util.download url query strings.
4. Refined devserver basic middleware stack (inject).
5. Fixed error in file editor upload() api handling.
6. Added theme listing to themeprep tool.
7. Added named view (Regional) listing.
8. Added live script(s) [batch] injection API to application.
9. Changed config.rapidEventDebounce to rapidEventDelay for both debounce and throttle calls.
10. Adjusted process-html tool to only include scripts in the html body section.
11. Refined core.Context module with map reg and get/set.
12. Refined tpl loading util method (added overriding ability).


1.7.2 (2014-09-09)
-------------------
1. Changed script concat EOL to be (os.EOL + ';') in tools.
2. Removed default app.config.baseAjaxURI value to fit Cordova dev better.
3. Disabled webkit touch callout & user selection in css. (for Cordova)
4. Refined build script and added default output folder path.
5. Refined region resize code & event propagation.
6. Removed navRegion constrain on listening to the view/context:navigate-chain events.
7. Added view:navigate-away event. (if parentCt persists)
8. Added parentRegion to views shown in a region.
9. Confirmed 'fileInput' option usage in file editor's .upload() api. (multi-file upload through single file editor, with fieldname all set to 'files[]')


1.7.1 (2014-08-29)
-------------------
1. Removed redundant info from bower release dist package.
2. Simplified themeprep script options.
3. Added support for fast-click on mobile platforms.
4. Refined app lock/unlock/available mech & updated docs.
5. Fixed args/path issue in tools to support stage-devtools.
6. Added i18n related config to app.setup(). Refined i18n file name setting.
7. Fixed $.ajax()'s and app.remote()'s default `dataType:'json'`.
8. Synced header-cell property with row-cell (+this.row, this.row.grid).
9. Added export script to build tool, for better code sharing in devtools.
10. Fixed view:render-data event with array in ItemViews.
11. Fixed upload editor callback scopes.
12. Replaced app.Util.theme-roller with loadCSS().
13. Added region.resize() ability for easier UI sizing control and propagation (e.g during full-screen mode).
14. Added overflow attrs on regions for easier region content overflow control.
15. Removed 'view:navigation-end' event, use 'view:naviagte-to' instead.
16. Added onBeforeNavigateTo() to contexts.
17. Removed raphael.js from deps.


1.7.0 (2014-08-19)
-------------------
1. Fixed themeprep tool icon path issue on Windows_NT;
2. Refined process-html.js tool to allow multiple js combine target (to separate widgets/editors out and help remove libprep scripts);
3. Added rounded-left/right class styles;
4. Added view:load-page-done/fail/always events to CollectionView;
5. Added hammer.js for multi-touch-screen events handling;
6. Fixed bootstrap @icon-font-path override in themes;
7. Refined fileupload editor and editor options, +editor.upload api;
8. Removed global crossdomain settings;
9. Individual ajax request can enable its crossdomain ability with the 'xdomain' option;
10. Reduced edge-build size, added fix in less-css tool for google-font;
11. Added stage-devtools npm package for streamlining new project dev;


1.6.3 (2014-08-07)
-------------------
1. Fixed i18n APIs;
2. Fixed template all.json loading on mobile platform;
3. Fixed app init sequence and added app:before-/app:template-ready events;
4. Fixed template watch tool filter on Windows_NT;


1.6.2 (2014-08-04)
-------------------
1. Fixed row event triggers intercept issue in Datagrid.
2. Converted theme mockups to _Mockups context.
3. Fixed String.split() errors in code by adding strong type conversion.
4. Added fieldset and fieldset-shadowed styles.


1.6.1 (2014-07-31)
-------------------
1. Fixed Windows_NT support in devserver (*-watch);
2. Fixed proxied service path redirect in devserver (/api -> /abc);
3. Fixed error in themeprep tool when /img/** folders are empty;


1.6.0 (2014-07-29)
-------------------
1. Removed default actions settings from datagrid action cell;
2. Added wrapper style (full, x2);
3. Added btn-outline, white;
4. Added heading style;
5. Added box style (heading, body);
6. Added border-ed style (top, left, right, bottom & -lg);
7. Added rounded, circle style (sm, lg, upper, lower);
8. Refined tpl-watch and less-watch worker; (removed gaze)
9. Added mockup loading short-cut to a region in template (view="@tpl.html")
10. Added proxied service support to devserver (http-proxy);


1.5.1 (2014-07-24)
------------------
1. app.config.viewTemplates now defaults to 'static/template';
2. An empty all.json now ships with all the dist packages;
3. Build tools now accepts creating ''s (blank files) in build configs;
4. app.config.baseAjaxURI now correctly gets picked up by app.remote();
5. Refined theme less structure;
6. Added theme preparation script to tools;
7. Removed resize, svg, cssprite theme helper scripts;


1.5.0 (2014-07-18)
-------------------
1. Added navigation guard function to Contexts. (auth related)
2. Added app:context-guard-error event to Application.


1.4.4 (2014-07-18)
------------------
1. Added row:clicked and row:dbclicked to Datagrid widget;
2. Removed CORS ability from remote template loading;
3. Fixed doc markdown format;


1.4.3 (2014-07-17)
------------------
1. Fixed bug in app nav/context region fallback upon app template empty;
2. Empty #navigate/ now fallback to the default context;
3. Code reviewed and linted;
4. Fixed bug in setting checkbox editor val (uncheck);
5. Removed 'context:navigate-to' event to reveal 'view:navigate-to' event in the navigation chain mech;


1.4.0 (2014-07-17)
------------------
1. Added new chainable navigation routing mech (navRegion) /v/sv/ssv/...;
2. Fixed bug in building templates (all.json) on non-unix machines;
3. Refined Application init/setup sequence;
4. Updated doc (how-to) about navigation mech changes;


1.3.2 (2014-07-11)
------------------
1. Allow '@\*\*/\*.html' remote templating to be used for application template;
2. Fixed navigation module/subpath broken-by-'/'-char issue;
3. Named app.view() will now be considered/registered as regionals;
4. Datagrid rows will now have a reference to their parent grid instance;


1.3.0 (2014-07-08)
------------------
1. Added remote view template support @*.html and all.json (compiled);
2. Added \*\*/\*.html -> all.json into build script;
3. Updated doc (how-to) about view templating changes;


1.2.2 (2014-07-08)
-------------------
1. fixed bug on region scanning in application's main template (#main);
2. fixed application kickstart seq to hook to correct ready event (normal/hybrid);
3. Allow multiple folder merge in build tool;
4. Added ready-to-use @fontface kits in bower.json;


1.2.1 (2014-06-23)
-------------------
1. added additional css class for editor help and status texts;
2. added auto fieldname generation for all basic editors;
3. refined doc about adding editor validations;
4. added parentCtx back to views;
5. added node/leaf class default css to tree nodes;
6. improved doc wordingz;


1.2.0 (2014-06-16)
------------------------
1. Refined 'app:navigation' event arguments;
2. Added headless(label-less) mode style to basic editors;
3. Added default value assignment to basic editors;
4. Refined status method in basic editor/item-view/layout;
5. Refined Compound editor (with eager validation disabled atm);
6. Refined icons prep + css-sprite tools (changed to use gm); 


1.1.2 (2014-05-29)
----------------
1. Fixed off-by-1 bug in Tree widget;
2. Allow app:navigate event listener to change window.location.hash path;
3. Rewired window.onerror to fire app:error event;
4. Removed view.flyTo and added view.overlay method to use views as overlays;
5. Re-run app.setup will override the app.config settings only;
6. Added context:navigate-away event for saving context state;
7. Added auto-caching to $.md plugin using $el.data();
8. Fixed bug in $.overlay() css recovery upon closing;
9. Delayed [ui] and [region] mark scanning to fit dynamic view template;


1.1.1 (2014-05-19)
------------------
1. Basic Editor: +options.remote (fetch options with app.remote);
2. Layout+: +regional fieldset to support form view pieces (get/setValues, validate, getEditor and this._fieldsets); [without the status method atm]
3. Activate Editors: +compound editor support;
4. Disabled editors now correctly get omitted during getValues();


1.0.1 (2014-05-09)
------------------
1. Give app.Core.Regional.get an options param to return instance;
2. region:load-view can now instantiate both Widget and Regional with options;
3. Renamed _isDefined() to has() in app.Core.Widget;
4. Fixed error in tools/shared/hammer.js to correctly creating output folders;
5. Fixed error in the default build config for project-kit distributions;
6. Fixed stage.js version error in bower.json for project-kit distributions;


1.0.0 release (2014-05-07)
--------------------------
1. added simple paginator (passive) widget
2. added view:load-page, view:page-changed to CollectionView instances (remote data only)
3. refined dev-server profile and router config
4. removed module wrap on Context definitions
5. fixed error in svg config for views
6. added meta-event pairs and view:reconfigure concepts into widget building


1.0.0-rc3 (2014-04-25)
----------------------
1. added dev-server (ajax-box-lite, with less monitor, easy routers, no session or DB by default) in tools
2. added app.model({data}) and app.collection([data]) back 
3. refined $.overlay
4. simple tree (presentation) widget
5. simple datagrid (presentation) widget
6. added data/html mocking library


1.0.0-rc2 (2014-04-15)
----------------------
1. updated framework documentation (draft version done)
2. replaced the remote data interfacing core module.
3. added/formalized object meta-event programming util.
4. added 'Page' and 'Area' aliases for 'Context'/'Regional'
5. added 'parentContext' and 'parentCt' for view objects shown through regions
6. auto-detect config for actions, svg/canvas paper, editors and enable them
7. deprecated the app.create() API in favor of detailed APIs
8. added disable(), isEnabled() and setChoices() APIs to editors
9. added getEditor() and removed get/setVal() APIs in views
10. merged 3rd-party processing tool into tools 
11. refined build targets, bower info and licensed under MIT


1.0.0-rc1 (2014-03-12)
----------------------
1. updated framework documentation (still in progress)
2. formalized project file structure
3. added unified app api entry point
4. refined build & deploy script
5. further reduced selected libs
6. refined region view loading, added app Core.Regional module
7. formalized theme building process and structure


1.0.0-pre (2014-02-12)
----------------------
1. updated framework documentation (still in progress)
2. refined the client app route implementation


0.13.x (2014-01-07)
-------------------
1. (done) Add general ajax/data op progress bar on top (nprogress) as application util
2. (done) Remove noty2 and replace it with a new alert/messaging system + prompt as application util (view.flyTo and $.overlay())
3. (done) Add a new 2-lvl accordion menu widget
4. (done) Leave nothing but titile <---> message, help on the banner, move user above the left menu accordion
5. (done) Make file upload work (both ajax and iframe post)
