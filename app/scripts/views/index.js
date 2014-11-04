define(["app", "marionette", "text!templates/index.html"], function (App, Marionette, IndexTemplate) {

	var IndexView = Backbone.Marionette.ItemView.extend({

		template: function(data){
			return _.template(IndexTemplate, {"variable": "data"})(data);
		},

		events: {
		},

		serializeData: function () {
			var data = {
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

			this.initEvents();

			//that.unparseTime(data.sheets[i].get("todaysTime"));

			//Create Sliders
			this.createSliders();

			//What happens when you move a slider
			this.initSliderData();

			//Setup what happens when you click on a colour change
			this.initColourChangeEvents();

			//Listen for model changes and update times
			that.listenTo(that.collection, 'change', that.updateTimeVisual);

			//Set total time
			$(".total-time").text(this.getTotalTime().replace(":", "H ") + "M");

			App.mainView.router.load({
                pageName: "index"
            })

		},


		initEvents: function () {
			var that = this;

			var bindTypeEnd = (App.os === "mac" || App.os === "windows") ? "mouseup" : "touchend";
			var bindTypeStart = (App.os === "mac" || App.os === "windows") ? "mousedown" : "touchstart";

			//Swip out actions
			var isSwipe = false;
			var isOpen = false;
			App.$$('.swipeout').on('open', function () {
				isSwipe = true;
				isOpen = true;
			});
			App.$$('.swipeout').on('close', function () {
				isSwipe = true;
				isOpen = false
			});

			//Open / close job options
			$(".item-link").on(bindTypeEnd, function(e){
				var el = $(this);
				setTimeout(function () {
					if (isSwipe === true || isOpen === true) {
						isSwipe = false;
						return
					};
					isSwipe = false;
					that.toggleJobOptions(el);
				}, 30);
			});

			//Pull to refresh
			var ptrContent = App.$$('.pull-to-refresh-content');
			ptrContent.on('refresh', function (e) {
				that.refresh();
			})

			// $("a.add-new").on(bindTypeEnd, function () {
			// 	Backbone.history.navigate("#/add-job", {trigger: true, replace: true});
			// });

			// //Stop linking through if trying to change the time.
			// $(".item-link").click(function(e){
			// 	if ( $(e.originalEvent.target).hasClass("time") ) {
			// 		e.preventDefault();
			// 	}
			// });

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
                    $(".total-time").text(that.getTotalTime().replace(":", "H ") + "M");
                    that.initEvents();
                },
                error: function (err, xhr, o) {
                    if (err.status === 401) {
                        App.Framework7.loginScreen();
                    } else {
                    	App.Framework7.alert("Oh no! Someone broke the internet.", 'Connection error');
                    }
                }
            });
		},

		getTotalTime: function () {
			var total = 0;

			for (var i = 0; i < this.collection.models.length; i ++) {
				total += parseInt(this.collection.models[i].get("todaysTime"));
			}

			return this.unparseTime(total);
		},

		initColourChangeEvents: function () {
			var that = this;

			//- With callbacks on click
			$('.favourite').on('click', function () {
			    var buttons1 = [
				    {
			            text: 'Pin by colour',
			            label: true
			        },
			        {
			            text: 'Red',
			            color: 'red',
			            onClick: function () {
			                that.changeColour("red", this)
			            }
			        },
			        {
			            text: 'Yellow',
			            color: 'yellow',
			            onClick: function () {
			                that.changeColour("yellow", this)
			            }
			        },
			        {
			            text: 'Blue',
			            color: 'blue',
			            onClick: function () {
			                that.changeColour("blue", this)
			            }
			        }
			    ];

			    var buttons2 = [
			        {
			            text: 'Cancel',
			            onClick: function () {
			            }
			        }
			    ]
			    var groups = [buttons1, buttons2];
			    App.Framework7.actions(groups);
			});   

			// App.$$('.select-red').on('click', function () {
				
			// });

			// App.$$('.select-blue').on('click', function () {
				
			// });

			// App.$$('.select-yellow').on('click', function () {
				
			// });
		},

		changeColour: function (colour, el) {
			var colour = ($(el).closest("li").hasClass(colour)) ? "" : colour;
			$(el).closest("li").removeClass("red yellow blue");
			$(el).closest("li").addClass(colour);
			App.Framework7.swipeoutClose($(el).closest("li"))
			
			var job = this.getId(el);
			
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


		//
		// Minutes -> 00:00
		//
		unparseTime: function (time) {
			var hours = ( Math.floor(time / 60) === 0 ) ? "0" : Math.floor(time / 60);
			var minutes = ( time % 60 < 10 ) ? "0" + (time % 60) : (time % 60);

			var str = hours + ":" + minutes;
			return str;
		},


		toggleJobOptions: function (el) {			
			var id = this.getId(el);
			var slider = $("#form-" + id).parent();
			slider.slideToggle();
		},

		startTiming: function (el) {
			
		},



		//Get job ID from any li child
		getId: function (el) {
			if (!(el instanceof jQuery)) el = $(el);
			var id = el.closest("li").attr("data-for") || el.closest("li").attr("id");
			return id;
		},



		///////////////////////////////////////
		////
		////	SLIDERS
		////
		///////////////////////////////////////

		createSliders: function () {
			var that = this;

			//Range slider init
			$(".timer-slider").each(function (index) {
				var id = that.getId(this);
 				var amount = that.collection.get(id).get("todaysTime");
 				var form = "#form-" + id;

 				if (amount === 0) amount = 0.1;

				var formData = {
					'slider': amount
				}
				App.Framework7.formFromJSON(form, formData);
			});

			var formData = App.Framework7.formToJSON("#form-544eab9edcdc6000000ca00d");
			var value = formData.slider;
		},

		initSliderData: function () {
			var that = this;

			//Get slider data
			var target = null,
				model = null;

			//Listen for slider movement
			$(".timer-slider input").on("mousedown touchstart", function () {
				var id = that.getId(this);
				target = id;
				model = that.collection.get(id);
			});

			$(".timer-slider input").on("mouseup touchend", function () {
				target = null;
				model = null;
			});

			$(".timer-slider input").on("mousemove touchmove", function () {
				that.getSliderData(target, model);
			});

		},

		getSliderData: function (target, model) {
			if (target === null || model === null) return;
			var formData = App.Framework7.formToJSON('#form-' + target);
			var value = formData.slider;
  			
  			model.set("todaysTime", parseInt(value));
		},




		//
		//	If a model changes using the slider - update the time and master time
		//
		updateTimeVisual: function (e) {
			var that = this;
			var time = e.get("todaysTime");
			var parsed = that.unparseTime(time);
			var target = $("#" + e.id).find(".job-timer .time").text(parsed);
		},





		
	});

	return IndexView;

});