define(["app", "backbone"], function (App, Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		idAttribute: "_id",

		defaults: {
			chaseId: 			null,
			customTitle: 		"",
			colour: 			null,
			isHidden: 			false,
			isAnonymous: 		false,
			isTiming: 			false,
			isFavourite: 		false,
			timingStamp: 		0,
			maxTiming: 			0,
			todaysTime:  		0
		},

		initialize: function () {
			var that = this;

			if (this.get("isTiming")) {
				var difference = new Date().getTime() - parseInt(that.get("timingStamp"));
				var addedTime = Math.round(difference / 1000 / 60);

				this.set("todaysTime", this.get("todaysTime") + addedTime)
			}			
			//this.listenTo(this, 'change', this.updateTime);
		},

		updateTime: function () {
			var that = this;

		    clearTimeout($.data(that, 'modelTimer'));
		    $.data(that, 'modelTimer', setTimeout(function() {
		    	that.sendUpdate();
		    }, 1000));

		},

		sendUpdate: function () {
			var that = this;

			$.ajax({
				url: App.urlRoot + "/updatesingle",
				type: "POST",
                data: {
                	id: App.userID, 
                	job: that.id, 
                	todaysTime: that.get("todaysTime")
                },
                success: function (data) {
                    console.log(data)
                },
                error: function (err, xhr, o) {
                    console.log(err, xhr, o)
                }
			})
		},


		startTiming: function () {
			var that = this;

			$.ajax({
				url: App.urlRoot + "/starttiming",
				type: "POST",
                data: {
                	id: App.userID, 
                	jobID: that.id, 
                	timingStamp: that.get("timingStamp"),
                	maxTiming: that.get("maxTiming")
                },
                success: function (data) {
                    console.log(data)
                },
                error: function (err, xhr, o) {
                    console.log(err, xhr, o)
                }
			})
		},

		stopTiming: function () {
			var that = this;

			var difference = new Date().getTime() - parseInt(that.get("timingStamp"));
			var addedTime = Math.round(difference / 1000 / 60);


			$.ajax({
				url: App.urlRoot + "/stoptiming",
				type: "POST",
                data: {
                	id: App.userID, 
                	jobID: that.id,
                	addedTime: addedTime,
                },
                success: function (data) {
                    console.log(data)
                },
                error: function (err, xhr, o) {
                    console.log(err, xhr, o)
                }
			})
		},

		favourite: function () {
			var that = this;
			that.set("isFavourite", !+ that.get("isFavourite"))
			$.ajax({
				url: App.urlRoot + "/favourite",
				type: "POST",
				data: {
					id: App.userID,
					jobID: that.id,
					isFavourite: + that.get("isFavourite")
				},
				success: function () {
					
				},
				error: function () {
					if (err.status === 401) {
                        App.Framework7.loginScreen();
                    } else {
                        App.Framework7.alert("Unable to update job", 'Connection error');
                    }
				}
			});
		},

		completeJob: function () {
			var that = this;
			
			$.ajax({
				url: App.urlRoot + "/togglehide",
				type: "POST",
				data: {
					id: App.userID,
					job: that.id,
					hide: true
				},
				success: function () {
					console.log("hidden")
				},
				error: function () {
					if (err.status === 401) {
                        App.Framework7.loginScreen();
                    } else {
                        App.Framework7.alert("Unable to update job", 'Connection error');
                    }
				}
			});
		}
	})

	return TimesheetModel;
})