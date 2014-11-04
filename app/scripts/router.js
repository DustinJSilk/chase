define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			"index": 					"index",
			"job/:id": 					"job",
			"add-new": 				"addNew"
		},

		controller: Controller

	})

	return AppRouter;
})
