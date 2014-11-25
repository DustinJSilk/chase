define(["app", "marionette", "text!templates/index.html"], function (App, Marionette, IndexTemplate) {

	var IndexView = Backbone.Marionette.ItemView.extend({

		template: function(data){
			return _.template(IndexTemplate, {"variable": "data"})(data);
		},

		events: {
		},

		serializeData: function () {
			var data = {
				sheets: this.collection.models,
				unsaved: (this.options.unsaved === true) ? "unsaved" : ""
			}
			for ( var i = 0; i < data.sheets.length; i ++ ) {
				data.sheets[i].todaysTime = this.unparseTime(data.sheets[i].get("todaysTime"));
			}
			console.log(data)
			return data;
		},

		events: {

		},

		onShow: function () {
			var that = this;

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
			$(".total-time").text(this.getTotalTime());

			App.mainView.router.load({
                pageName: "index"
            });


			//If showing unsaved items
            if ( this.options.unsaved ) {
            	$(".unsaved").css({"top": 0})
                setTimeout(function () {
                    App.Framework7.alert("Make sure yesterdays timesheets are all good before you save them to Chase." , 'Unsaved Timesheets!');
                }, 600)
            }

            this.initEvents();

		},


		initEvents: function () {
			var that = this;

			var bindTypeEnd = (App.os === "mac" || App.os === "mobile") ? "mouseup" : "touchend";
			var bindTypeStart = (App.os === "mac" || App.os === "mobile") ? "mousedown" : "touchstart";

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


			$(".swipe-complete").on("click", function (e) {
				var target = $(e.target).closest("li");
				that.completeJob(target);
			});

			$(".swipe-timer").on("click", function (e) {
				var target = $(e.target).closest("li");
				that.swipeTimer(target);
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

			$("#show-completed").on(bindTypeEnd, function (){
				$(".timesheet-item.complete").slideToggle()
			})



			//If showing unsaved items
            if ( this.options.unsaved ) {
            	$(".unsaved .finish ").on(bindTypeEnd, function () {
            		Backbone.history.navigate("#save-all", {trigger: true, replace: true});
            	})
            	$(".unsaved .cancel a").on(bindTypeEnd, function () {
            		App.Framework7.confirm("Any unsaved time will return to what is currently saved on Chase." , 'Are you sure?', function () {
            			Backbone.history.navigate("#purge-all", {trigger: true, replace: true});
            		});
            		
            	})
            }

            //disable swipe out on slide
            $(".timesheet-item input").on(bindTypeStart, function (){
            	$(this).closest("li").removeClass("swipeout");
            })
            $(".timesheet-item input").on(bindTypeEnd, function (){
            	$(this).closest("li").addClass("swipeout");
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
                    $(".total-time").text(that.getTotalTime());
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
			$('.colourize').on('click', function () {
				var el = this;
			    var buttons1 = [
				    {
			            text: 'Pin by colour',
			            label: true
			        },
			        {
			            text: 'Red',
			            color: 'red',
			            onClick: function () {
			                that.changeColour("red", el)
			            }
			        },
			        {
			            text: 'Yellow',
			            color: 'yellow',
			            onClick: function () {
			                that.changeColour("yellow", el)
			            }
			        },
			        {
			            text: 'Blue',
			            color: 'blue',
			            onClick: function () {
			                that.changeColour("blue", el)
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
			var job = this.getId(el);

			var colour = ($(el).closest("li").hasClass(colour)) ? "" : colour;

			
			$(el).closest("li").removeClass("red yellow blue").addClass(colour);

			//App.Framework7.swipeoutClose($(el).closest("li"));
			
			
			$.ajax({
				url: App.urlRoot + "/colour",
				type: "POST",
				data: {
					id: App.userID,
					job: job,
					colour: colour
				},
				success: function () {
					console.log("success")
				},
				error: function () {
					
				}
			});
		},

		completeJob: function (target) {
			var job = this.getId(target);

			$.ajax({
				url: App.urlRoot + "/togglehide",
				type: "POST",
				data: {
					id: App.userID,
					job: job,
					hide: true
				},
				success: function () {
					target.slideUp(400, function(){
						target.addClass("complete");
					});
				},
				error: function () {
					if (err.status === 401) {
                        App.Framework7.loginScreen();
                    } else {
                        App.Framework7.alert("Oh no! Someone broke the internet.", 'Connection error');
                    }
				}
			});

		},


		//
		// Minutes -> 00:00
		//
		unparseTime: function (time, addSpan) {
			var hours = ( Math.floor(time / 60) === 0 ) ? "0" : Math.floor(time / 60);
			var minutes = ( time % 60 < 10 ) ? "0" + (time % 60) : (time % 60);

			var str;

			if (addSpan) {
				str = hours + "<span>:</span>" + minutes;
			} else {
				str = hours + ":" + minutes;
			}
			
			return str;
		},


		toggleJobOptions: function (el) {			
			var slider = el.parent().find(".timer-slider");
			slider.slideToggle();
			slider.toggleClass("isOpen");

			if (slider.hasClass("isOpen")) {
				slider.closest("li").removeClass("swipeout");
			} else {
				slider.closest("li").addClass("swipeout");
			}
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
 				var form = $(this).find("form");

 				if (amount === 0) amount = 0.1;

				var formData = {
					'slider': amount
				}
				App.Framework7.formFromJSON(form, formData);
			});

			// var formData = App.Framework7.formToJSON("#form-544eab9edcdc6000000ca00d");
			// var value = formData.slider;
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
				$(".total-time").text(that.getTotalTime());
			});

			$(".timer-slider input").on("mousemove touchmove", function () {
				that.getSliderData(target, model);
				$(".total-time").text(that.getTotalTime());
			});

		},

		getSliderData: function (target, model) {

			if (target === null || model === null) return;
			var formData = App.Framework7.formToJSON('#form-' + target);
			var value = formData.slider;
  			model.set("todaysTime", parseInt(value));
		},



		updateTimeVisual: function (e) {
			var that = this;
			var time = e.get("todaysTime");
			var parsed = that.unparseTime(time);
			var target = $("#" + e.id).find(".job-timer .time").text(parsed);
		},


		swipeTimer: function (target) {
			if ($(".is-timing").length > 0 && this.getId(target) !== this.getId($(".is-timing").eq(0)) ) {
				App.Framework7.swipeoutClose(target);
				App.Framework7.alert("Slow down there, one job at a time.", "You're already timing");
				return;
			} 

			if (this.getId(target) === this.getId($(".is-timing").eq(0))) {
				this.stopTiming(target);
				App.Framework7.swipeoutClose(target);
			} else {
				var buttons1 = [
				    {
			            text: 'Max time',
			            label: true
			        },
			        {
			            text: 'Forever',
			            //color: 'red',
			            onClick: function () {
			                this.startTiming(target, 1440);
			            }
			        },
			        {
			            text: '8 Hours',
			            //color: 'yellow',
			            onClick: function () {
			                that.changeColour(target, 480)
			            }
			        },
			        {
			            text: '4 Hours',
			            //color: 'blue',
			            onClick: function () {
			                that.changeColour(target, 240)
			            }
			        },
			        {
			            text: '2 Hours',
			            //color: 'blue',
			            onClick: function () {
			                that.changeColour(target, 120)
			            }
			        },
			        {
			            text: '1 Hour',
			            //color: 'blue',
			            onClick: function () {
			                that.changeColour(target, 60)
			            }
			        },
			        {
			            text: '30 Minutes',
			            //color: 'blue',
			            onClick: function () {
			                that.changeColour(target, 30)
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
				App.Framework7.swipeoutClose(target);
			}

			
		},


		startTiming: function (target, max) {
			var that = this;
			var id = this.getId(target);

			that.collection.get(id).set("isTiming", true);
			that.collection.get(id).set("maxTiming", max);
			that.collection.get(id).set("timingStamp", new Date().getTime());

			that.collection.get(id).startTiming();

			target.find("swipeout-actions-left").removeClass("swipeout-actions-left").addClass("swipeout-actions-left-disabled");

			target.addClass("is-timing");
		},



		stopTiming: function (target) {
			var id = this.getId(target);
			that.collection.get(id).startTiming();
		}



		
	});

	return IndexView;

});