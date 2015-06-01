/**
 * Infrastructure Plugin: Navigation (based on Director)
 *
 * 
 * APIs
 * ----
 * 1. navigate(route) -- Set the current route. (Recommended)
 * @route {String}: Supply a route value, such as home/stats.
 * 
 * 2. navigate(start, length) -- Remove a segment from the current route.
 * @start {Number} - The position at which to start removing items.
 * @length {Number} - The number of items to remove from the route.
 * 
 * 3. navigate(index, value) -- Set a segment of the current route.	
 * @index {Number} - The hash value is divided by forward slashes, each section then has an index.
 * @value {String} - The new value to assign the the position indicated by the first parameter.
 *
 *
 * Gotcha
 * ------
 * #<empty> will not get you anywhere at runtime. Upon loading, it will be treated as no hash and replaced by #<app.home>
 *
 * 
 * @author Tim Lauv
 * @created 2015.05.10
 */

(function(app, Router){


	//-----------------------------default route--------------------------
	app.config({
		routes: {
			//default routing implementation (forward the navigation e, params):
			'([^/]+)/?([^/]*)/?(.*)': function(ctx, item, rest){
				app.coordinator.trigger('app.navigate', ctx, item, rest); //--> <*required>
			}			
		},

		//++api++
		navigate: function(){
			return this.router.setRoute.apply(this.router, arguments);
		}

		//++hidden api++
		//app.router.getRoute([index]) -- Returns the entire route or just a section of it.
		//@index {Number}: The hash value is divided by forward slashes, each section then has an index, if this is provided, only that section of the route will be returned.

	});

	//-------------------------upon app.ready, activate-------------------
	app.coordinator.once('app.ready', function(){
		//kick off navigation
		app.router = new Router(app.routes).init(app.home);
	});


})(Application, Router);