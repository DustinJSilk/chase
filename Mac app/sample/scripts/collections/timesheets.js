define(["app", "backbone", "models/timesheet"], function (App, Backbone, TimesheetModel) {

	var PlayCollection = Backbone.Collection.extend({

		model: TimesheetModel,

		initialize: function () {

		},

		parse: function (response) {
			var that = this;

			response.sort(function (a, b) {
				if (a.isHidden < b.isHidden) return -1;
				if (a.isHidden > b.isHidden) return 1;

				if (a.isFavourite < b.isFavourite) return 1;
				if (a.isFavourite > b.isFavourite) return -1;

				// Sort by highest number
				if (a.todaysTime !== b.todaysTime) return b.todaysTime - a.todaysTime;

				// Sort alphabetically
				if(a.customTitle < b.customTitle) return -1;
			    if(a.customTitle > b.customTitle) return 1;
			    
			    // Default the same
			    return 0;
				
			})

			return response
		}

	})

	return PlayCollection;
})