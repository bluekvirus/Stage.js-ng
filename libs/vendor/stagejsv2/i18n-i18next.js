/**
 * Infrastructure Plugin: Internationalization/Localization based on i18next.js
 *
 * e.g
 * --> i18n/en-US/translation.json
 * {
 * 	key1: '...translation...',
 * 	key1_contextA: '...translation...',
 * 	key2: '__myVar__ ...translation...',
 * 	path: {
 * 		key3: '...translation...'
 * 	}
 * }
 *
 * e.g
 * 'key1'.i18n()
 * 'key1'.i18n({context: contextA})
 * 'key2'.i18n({myVar: 12})
 * 'path.key3'.i18n()
 *
 * e.g
 * <div>
 * 	<span data-i18n="key1"><span>
 *  <span data-i18n>key1<span>
 *  <span data-i18n="key1" data-i18n-options='{"context":"contextA"}'></span>
 * </div>
 * use $('span').i18n() or $('div').i18n()
 * 
 * Note that $.t() === i18n.t === app.i18n
 * 
 * 
 * @author Tim Lauv
 * @created 2015.05.10
 */

(function(app, i18n, _){

	app._cache.missingKeys = app._cache.missingKeys || {};

	app.coordinator.on('app:load', function(){
		i18n.init({
			detectLngQS: 'locale',
			resGetPath: 'i18n/__lng__/__ns__.json',
			ns: 'translation',
			useDataAttrOptions: true,
			useCookie: false,
			load: 'current', //only load specific locale, e.g en-US instead of en
			fallbackLng: app.param('localepatch', false),
			missingKeyHandler: function(lng, ns, key, defaultValue, lngs){
				app._cache.missingKeys[lng] = app._cache.missingKeys[lng] || {};
				app._cache.missingKeys[lng][key] = defaultValue;
			}
		}, function(t){
			app.i18n = t;
			app.coordinator.trigger('app:loaded');
		});

	});

	//enhance the basic String type
	String.prototype.i18n = function(options) {
		var key = _.trim(this);

		return i18n.t(key, options);
	};

})(Application, i18n, _);