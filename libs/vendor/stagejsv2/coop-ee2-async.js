/**
 * Infrastructure Plugin: Coordinator based on EventEmitter2, async
 *
 * @author Tim Lauv
 * @created 2015.05.10
 */

(function(app, EventEmitter, async){

	app.config({
		coordinator: new EventEmitter({
			wildcard: true, //enable a.* and a.*.c as event name
			delimiter: ':', //in between name segments (for wildcard matching)
			maxListeners: 15 //per event
		}),
	});

	//enhance the coordinator.emit (+ event name, if no args, + trigger, fire as alias)
	//mask the coordinator.on/off to support wildcard '*' any event.
	var _oldemit = app.coordinator.emit;
	var _oldon = app.coordinator.on;
	var _oldoff = app.coordinator.off;
	app.coordinator.emit = app.coordinator.trigger = app.coordinator.fire = function(){
		if(arguments.length === 1)
			_oldemit.call(app.coordinator, arguments[0], arguments[0]);
		else
			_oldemit.apply(app.coordinator, arguments);
	};
	app.coordinator.on = function(){
		if(arguments.length === 2 && arguments[0] === '*')
			return app.coordinator.onAny(arguments[1]);
		return _oldon.apply(app.coordinator, arguments);
	};
	app.coordinator.off = function(){
		if(arguments.length === 2 && arguments[0] === '*')
			return app.coordinator.offAny(arguments[1]);
		return _oldoff.apply(app.coordinator, arguments);
	};

	//+async.js
	app.coordinator.async = async;

})(Application, EventEmitter2, async);