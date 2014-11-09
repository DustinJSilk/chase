define(["app", "backbone", "models/timesheet"], function (App, Backbone, TimesheetModel) {

	var PlayCollection = Backbone.Collection.extend({

		model: TimesheetModel,

		initialize: function () {

		},

		getColourRank: function (colour) {
			var rank = 0;
			switch (colour) {
				case "red":
					rank = 3;
					break;
				case "yellow":
					rank = 2;
					break;
				case "blue":
					rank = 1;
					break;
				default: 
					rank = 0;
					break;
			}
			return rank;
		},

		parse: function (response) {
			var that = this;

			response.sort(function (a, b) {
				// Sort by colour
				if (that.getColourRank(a.colour) < that.getColourRank(b.colour)) return 1;
				if (that.getColourRank(a.colour) > that.getColourRank(b.colour)) return -1;

				// Sort by highest number
				if (a.todaysTime !== b.todaysTime) return a.todaysTime - b.todaysTime;

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