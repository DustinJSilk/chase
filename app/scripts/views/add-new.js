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
			var that = this;
			App.mainView.router.loadContent($("#add-new-template").html())

            $(".go-back").click(function(){
            	App.mainView.back();
            	Backbone.history.navigate("#index", {trigger: true, replace: true});
            	that.remove();
            });

            this.initEvents();
		},

		initEvents: function () {
			var that = this;

			var bindTypeEnd = (App.os === "mac" || App.os === "windows") ? "mouseup" : "touchend";
			var bindTypeStart = (App.os === "mac" || App.os === "windows") ? "mousedown" : "touchstart";

			$(".add-new a.finish").on(bindTypeEnd, function(e){
				that.submit();
			})
		},

		submit: function () {
			this.model.set("customTitle", $("#custom-title").val());

			this.model.createNew();
		}
	});

	return AddNewView;

});

