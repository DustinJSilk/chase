define(["app", "backbone"], function (App, Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		defaults: {
			searchTerm: 			null,
			customTitle: 		"",
			colour: 			null,
			isHidden: 			false,
			isAnonymous: 		false,
			isTiming: 			false,
			timingStamp: 		0,
			todaysTime:  		0,
			todaysDay: 			0,
			record: 			[]
		},

		sendUpdate: function () {
			var that = this;

			$.ajax({
				url: App.urlRoot + "/updatesingle",
				type: "POST",
                data: {id: App.userID, job: that.id, todaysTime: that.get("todaysTime")},
                success: function (data) {
                    console.log(data)
                },
                error: function (err, xhr, o) {
                    console.log(err, xhr, o)
                }
			})
		}
	})

	return TimesheetModel;
})