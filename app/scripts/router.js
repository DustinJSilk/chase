define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			"index": 					"index",
			"test": 					"test",
			"job/:id": 					"job"
		},

		controller: Controller

	})

	return AppRouter;
})
