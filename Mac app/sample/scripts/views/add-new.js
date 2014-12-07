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
            	$(".add-new .link-job").removeClass("active");
            	App.mainView.back();
            	Backbone.history.navigate("#index", {trigger: true, replace: true});
            	that.remove();
            });

            $("#search-jobs").on("input", function () {
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
			});

			$(".add-new .link-job").on(bindTypeEnd, function (){
				$(".search-wrapper").toggle();
				$(".add-new .link-job").toggleClass("active");
				var isAnonymous = (that.model.get("isAnonymous") === 1) ? 0 : 1;
				that.model.set("isAnonymous", isAnonymous);
			})

			$(".search-wrapper a").on(bindTypeEnd, function (){
				that.hideSearch();
				$(".search-wrapper input").val("");
			})
		},

		submit: function () {
			if (this.model.get("isAnonymous") === 0 && this.model.get("jobid") === null) {
				App.Framework7.alert("Please add a job to this task.", "You're not finised yet!");
				return;
			}

			if ($("#custom-title").val() === null || $("#custom-title").val().length === 0 ) {
				App.Framework7.alert("You need to give this job a name.", "You're not finised yet!");
				return;
			}

			this.model.set("customTitle", $("#custom-title").val());
			this.model.createNew();
		},

		updateSearch: function () {
			var that = this;

			clearTimeout($.data(this, 'searchTimer'));
		    $.data(this, 'searchTimer', setTimeout(function() {
				that.model.search($("#search-jobs").val());
		    }, 400));
		},

		focusSearch: function () {
			var top = $(".search-wrapper").offset().top;

			$(".search-wrapper input").val("");

			//set page content
			$(".page-content").css({
				"z-index": "600",
				"position": "relative"
			}).find(".view").css({
				"position": "static"
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

			setTimeout(function(){
				$(".search-wrapper a").css({"opacity": 1});
			}, 300)

			$(".background").animate({"opacity": 1}, 600)

			

            this.listenTo(this.model, 'change', this.addSearchResults);

		},

		selectSearch: function (e) {
			var that = this;
			this.stopListening(this.model);
			$.ajax({
				url: App.urlRoot + "/grabjob",
				type: "POST",
                data: {
                	id: App.userID, 
                	jobNumber: parseInt(e.attr("data-jobnumber"))
                },
                success: function (data) {
                	that.model.set("jobName", data.results.jobName);
                	that.model.set("productid", data.results.productid);
                	that.model.set("clientid", data.results.clientid);
                	that.model.set("jobid", e.attr("data-jobid"));
                	that.model.set("jobnumber", e.attr("data-jobnumber"));

                	$("#search-jobs").val(data.results.jobName);

                	that.hideSearch();
                }
            });

		},

		addSearchResults: function () {
			var that = this;

			var items = this.model.get("searchResults");

			$(".search-results").html("")
			for (var i = 0; i < items.length; i ++) {
				$(".search-results").append("<li data-jobid='" + items[i][0] + "' data-jobnumber='" + items[i][1].match(/\d+(\d+|\w+)/) + "'>" + items[i][1] + "</li>")
			}

			var bindTypeEnd = (App.os === "mac" || App.os === "windows") ? "mouseup" : "touchend";
			$(".search-results li").on(bindTypeEnd, function () {
				that.selectSearch($(this));
			})
		},

		hideSearch: function () {

			$(".search-wrapper a").css({"opacity": ""});

			$(".page-content").css({
				"z-index": "",
				"position": ""
			}).find(".view").css({
				"position": "relative"
			});;
			
			$(".search-wrapper").css({
				"position": 	"relative",
				"top": 			0,
				"height": 		"auto"
			});
			$(".search-results").remove();

		}
	});

	return AddNewView;

});

