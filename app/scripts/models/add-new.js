define(["app", "backbone"], function (App, Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		defaults: {
			searchTerm: 		null,
			customTitle: 		"",
			colour: 			null,
			isAnonymous: 		1,
			searchResults: 		[]
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
                    App.Framework7.alert("Oh no! Something went wrong.", 'Connection Error');
                }
			})
		},

		search: function () {
			var that = this;

			$.ajax({
				url: App.urlRoot + "/search",
				type: "POST",
                data: {
                	id: App.userID, 
                	searchTerm: that.get("searchTerm")
                },
                success: function (data) {
                	try {
                		// Convert string to array
                		var array = data.results.match(/\[([^\]]+\])/g);

                		// Remove braces from string array
                		for (var i = 0; i < array.length; i ++) {
                			array[i] = array[i].replace(/[\[\]]/g, "");
                		}

                		// Make sub arrays
                		for (var n = 0; n < array.length; n ++) {
                			arrayItem = array[n]; 
                			array[n] = [];
                			array[n].push(parseInt(arrayItem.substr(0, arrayItem.indexOf(','))))
                			array[n].push(arrayItem.substr(arrayItem.indexOf(',') + 1, arrayItem.length).replace(/\"/g, ""))
                		}

                		that.searchResults = array;

                	} catch (e) {
                		App.Framework7.alert("Oh no! Something went wrong. We're working on getting this fixed.", 'Technical Error');
                	}

                },
                error: function () {
                    App.Framework7.alert("Oh no! Something went wrong.", 'Conection Error');
                }
			})
		}
	})

	return TimesheetModel;
})






