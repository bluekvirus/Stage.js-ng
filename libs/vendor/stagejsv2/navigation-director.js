/**
 * Infrastructure Plugin: Navigation (based on Director)
 *
 * @author Tim Lauv
 * @created 2015.05.10
 */

(function(app, Router){


	//-----------------------------default route--------------------------
	app.config({
		routes: {
			//default routing implementation (forward the navigation e, params):
			'([^\/]*)\/?([^\/]*)\/?(.*)': function(ctx, item, rest){
				app.coordinator.trigger('app.navigate', ctx, item, rest); //--> <*required>
			}			
		},

		//++api++
		navigate: function(path){
			return this.router.setRoute(path);
		}
	});

	//-------------------------upon app.ready, activate-------------------
	app.coordinator.once('app.ready', function(){
		//kick off navigation
		app.router = new Router(app.routes).init();		
	});


})(Application, Router);