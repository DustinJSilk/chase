define(["app", "marionette", "text!templates/add-new.html", "lib/easing"], function (App, Marionette, AddNewTemplate) {

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

            $("#search-jobs").on("input", function () {
            	console.log("change")
            	that.updateSearch();
            });
            $("#search-jobs").on("focus", function () {
            	that.focusSearch();
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
		},

		updateSearch: function () {
			var that = this;

			clearTimeout($.data(this, 'searchTimer'));
		    $.data(this, 'searchTimer', setTimeout(function() {
		        that.model.set("searchTerm", $("#search-jobs").val());
				that.model.search();
		    }, 600));
		},

		focusSearch: function () {
			var top = $(".search-wrapper").offset().top;

			//set page content
			$(".page-content").css({
				"z-index": "600",
				"position": "relative"
			});

			//set search wrapper
			$(".search-wrapper").css({
				"position": 	"fixed",
				"height": 		"100%",
				"top": 			"0"
			});

			//animate search input
			$(".search-wrapper").css({
				"top": top
			}).animate({
				"top": 0
			}, 500, "easeOutQuad");

			$(".background").animate({"opacity": 1}, 600)

            this.listenTo(this.model, 'change', this.addSearchResults);

		},

		selectSearch: function () {
			
			this.stopListening(this.model);

			$(".page-content").css({
				"z-index": "600",
				"position": "relative"
			});
			
			$(".search-wrapper").css({
				"position": 	"fixed",
				"width": 		"100%",
				"top": 			$(".search-wrapper").offset().top
			}).animate({
				"top": 0
			}, 600);

		},

		addSearchResults: function () {
			console.log("adding")
		}
	});

	return AddNewView;

});

