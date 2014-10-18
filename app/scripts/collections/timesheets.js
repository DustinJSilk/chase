define(["app", "backbone", "models/timesheet"], function (App, Backbone, TimesheetModel) {

	var PlayCollection = Backbone.Collection.extend({

		model: TimesheetModel,

		initialize: function () {

		}

	})

	return PlayCollection;
})