define(["app", "marionette", "text!templates/job.html"], function (App, Marionette, JobTemplate) {

	var JobView = Backbone.Marionette.ItemView.extend({

		className: "view",

		template: function(){
			return _.template(JobTemplate, {"variable": "data"})(data);
		},

		serializeData: function () {
			var data = {
			}

			return data;
		},

		onShow: function () {
			App.mainView.router.load({
                pageName: "job"
            })
		}
	});

	return JobView;

});

