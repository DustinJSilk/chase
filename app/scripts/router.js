define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			"index": 					"index"
		},

		controller: Controller

	})

	return AppRouter;
})
