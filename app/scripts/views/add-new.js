define(["app", "marionette", "text!templates/add-new.html"], function (App, Marionette, AddNewTemplate) {

	var AddNewView = Backbone.Marionette.ItemView.extend({

		className: "view",

		initialize: function () {
		},

		template: function(data){
			return _.template(AddNewTemplate, {"variable": "data"})(data);
		},

		serializeData: function () {
			var data = {
			}

			return data;
		},

		onShow: function () {
			console.log("showing")
			var that = this;
			App.mainView.router.loadContent($("#add-new-template").html())

            $(".go-back").click(function(){
            	App.mainView.back();
            	Backbone.history.navigate("#index", {trigger: true, replace: true});
            	that.remove();
            })
		}
	});

	return AddNewView;

});

