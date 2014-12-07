define(["marionette", "controller"], function (Marionette, Controller){
	
	var AppRouter = Marionette.AppRouter.extend({
		
		appRoutes: {
			"index": 					"index",
			"job/:id": 					"job",
			"add-new": 					"addNew",
			"save-all": 				"saveAll",
			"unsaved": 					"unsaved",
			"purge-all": 				"purgeAll",
			"logout": 					"logout"
		},

		controller: Controller

	})

	return AppRouter;
})
