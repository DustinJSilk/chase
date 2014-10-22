define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			"index": 					"index",
			"test": 					"test"
		},

		controller: Controller

	})

	return AppRouter;
})
