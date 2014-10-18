define(["app", "marionette", "text!templates/index.html"], function (App, Marionette, IndexTemplate) {

	var IndexView = Backbone.Marionette.ItemView.extend({

		template: function(data){
			return _.template(IndexTemplate, {"variable": "data"})(data);
		},

		events: {
		},

		serializeData: function () {
			var data = {
				total: this.getTotalTime(),
				sheets: this.collection.models
			}

			return data;
		},

		onShow: function () {
			var that = this;

			App.$$('.select-red').on('click', function () {
				that.changeColour("red", this)
			});

			App.$$('.select-blue').on('click', function () {
				that.changeColour("blue", this)
			});

			App.$$('.select-yellow').on('click', function () {
				that.changeColour("yellow", this)
			});
		},

		getTotalTime: function () {
			var total = 0;

			for (var i = 0; i < this.collection.models.length; i ++) {
				total += this.collection.models[i].record;
			}

			return total;
		},

		changeColour: function (colour, el) {
			var colour = ($(el).closest("li").hasClass(colour)) ? "" : colour;
			$(el).closest("li").removeClass("red yellow blue");
			$(el).closest("li").addClass(colour);
			App.Framework7.swipeoutClose($(el).closest("li"))
			var job = $(el).closest("li").attr("data-id");
			
			$.ajax({
				url: App.urlRoot + "/colour",
				type: "POST",
				data: {
					id: App.userID,
					job: job,
					colour: colour
				},
				success: function () {

				},
				error: function () {
					
				}
			});

		}

		
	});

	return IndexView;

});