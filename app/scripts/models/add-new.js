define(["app", "backbone"], function (App, Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		defaults: {
			searchTerm: 		null,
			customTitle: 		"",
			colour: 			null,
			isAnonymous: 		1
		},

		createNew: function () {
			var that = this;

			$.ajax({
				url: App.urlRoot + "/createnew",
				type: "POST",
                data: {
                	id: App.userID, 
                	customTitle: that.get("customTitle"),
					colour: that.get("colour"),
					isAnonymous: that.get("isAnonymous"),
					linkedJob: {
						
					}
                },
                success: function (data) {
                    Backbone.history.navigate("#index", {trigger: true, replace: true});
                },
                error: function () {
                    App.Framework7.alert("Oh no! Something went wrong.", 'Error');
                }
			})
		}
	})

	return TimesheetModel;
})