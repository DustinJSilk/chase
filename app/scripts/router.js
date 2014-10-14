define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			//"index": 					"index",
			"login": 					"login"
		},

		controller: Controller

	})

	return AppRouter;
})
