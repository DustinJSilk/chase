define(["app", "backbone"], function (App, Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		defaults: {
			customTitle: 		"",
			colour: 			null,
			isAnonymous: 		1,
			searchResults: 		[],
			jobName: 			null,
            productid: 			null,
            clientid: 			null,
            jobid: 			 	null,
            jobnumber: 			null,
            notes: 				""
		},

		createNew: function () {
			var that = this;
			var path = (this.get("isAnonymous")) ? "addanonymous" : "addnew";

			$.ajax({
				url: App.urlRoot + "/" + path,
				type: "POST",
                data: {
                	id: App.userID, 
                	customTitle: that.get("customTitle"),
					colour: that.get("colour"),
					isAnonymous: that.get("isAnonymous"),
					linkedJob: {
						jobid:              that.get("jobid"),
                        customerid:         that.get("clientid"),
                        productid:          that.get("productid"),
                        tasktypeid:         110,//App.user.type,
                        notes:              that.get("notes")
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

		search: function (searchTerm) {
			var that = this;
            try {
                that.searchAjax.abort();
            } catch(e){}

			this.searchAjax = $.ajax({
				url: App.urlRoot + "/search",
				type: "POST",
                data: {
                	id: App.userID, 
                	searchTerm: searchTerm
                },
                success: function (data) {
                    if (data.results.length === 0) {
                        that.set("searchResults", [])
                        return;
                    }

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

                		that.set("searchResults", array)

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






