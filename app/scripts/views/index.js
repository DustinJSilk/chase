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

			for ( var i = 0; i < data.sheets.length; i ++ ) {
				data.sheets[i].todaysTime = this.unparseTime(data.sheets[i].get("todaysTime"));
			}

			return data;
		},

		events: {

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


			var ptrContent = App.$$('.pull-to-refresh-content');
			ptrContent.on('refresh', function (e) {
				that.refresh();
			})



			var pressTimer,
				isShort = true;

			var bindTypeEnd = (App.os === "mac" || App.os === "windows") ? "mouseup" : "touchend";
			var bindTypeStart = (App.os === "mac" || App.os === "windows") ? "mousedown" : "touchstart";

			$(".job-timer").on(bindTypeEnd, function(e){
				clearTimeout(pressTimer);
				if ( isShort === true ) {
					that.editTime($(this));
				}
				//return false;
			}).on(bindTypeStart, function(){
				pressTimer = window.setTimeout(function() {
					isShort = false;
					that.startTiming($(this));
				},1000)
				//return false; 
			});


			//Stop linking through if trying to change the time.
			$(".item-link").click(function(e){
				if ( $(e.originalEvent.target).hasClass("time") ) {
					e.preventDefault();
				}
			});

			//that.unparseTime(data.sheets[i].get("todaysTime"));

			//Range slider init
			$(".timer-slider").each(function (index) {
 				var amount = that.collection.get($(this).attr("data-for")).get("todaysTime");
 				var form = $(this).find("form").attr("id");

				var formData = {
					'slider': amount
				}

				App.Framework7.formFromJSON("#" + form, formData);

			})



			$(".timer-slider input").on("mousemove", function () {
				console.log("moving")
			})
		},

		refresh: function () {
			var that = this;

			$.ajax({
                url: App.urlRoot + "/timesheets",
                type: "POST",
                data: {id: App.userID},
                success: function (data) {
                    that.collection.reset(data.timeSheets.sheets);
                    that.render();
                    App.Framework7.pullToRefreshDone();
                },
                error: function (err, xhr, o) {
                    if (err.status === 401) {
                        App.Framework7.loginScreen();
                    }
                }
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
			var job = $(el).closest("li").attr("id");
			
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
		},

		unparseTime: function (time) {
			var hours = ( Math.floor(time / 60) === 0 ) ? "" : Math.floor(time / 60);
			var minutes = ( time % 60 < 10 ) ? "0" + (time % 60) : (time % 60);

			var str = hours + ":" + minutes;
			return str;
		},

		editTime: function (el) {
			var isMobile = (App.os === "mac" || App.os === "windows") ? false : true;
			
			if ( isMobile ) {
				el.parent().find(".input-time").focus();
			} else {
				el.find("span").prop('contenteditable', true).focus().blur(function () {
					el.find("span").prop('contenteditable', false);
				});
				var id = el.closest("li").attr("id");
				var slider = $("#form-" + id).parent();

				slider.slideDown();
			}
			
		},

		startTiming: function (el) {
			
		}

		
	});

	return IndexView;

});