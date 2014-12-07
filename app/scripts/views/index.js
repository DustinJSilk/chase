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

            //Start timing if any jobs are tracking time
            if ($(".is-timing").length > 0) {
            	var target = $(".is-timing").eq(0);
            	this.timingInterval(target);
            	target.find(".swipeout-actions-left").addClass("swipeout-actions-left-disabled").removeClass("swipeout-actions-left");
            }

            this.initEvents();

		},

		initEvents: function () {
			var that = this;

			var preventOpen = false;

			var bindTypeEnd = (App.platform === "desktop") ? "mouseup" : "touchend";
    		var bindTypeStart = (App.platform === "desktop") ? "mousedown" : "touchstart";

			//Swip out actions
			var isSwipe = false;
			var isOpen = false;
			App.$$('.swipeout').off("open").on('open', function () {
				isSwipe = true;
				isOpen = true;
			});
			App.$$('.swipeout').off("close").on('close', function () {
				isSwipe = true;
				isOpen = false
			});


			$(".swipe-complete, .job-icons-complete").off("click").on("click", function (e) {
				var target = $(e.target).closest("li");
				that.completeJob(target);
			});
			// $(".swipe-complete, job-icons-complete").on("click", function (e) {
			// 	var target = $(e.target).closest("li");
			// 	that.completeJob(target);
			// });

			$(".swipe-timer").off("click").on("click", function (e) {
				var target = $(e.target).closest("li");
				that.swipeTimer(target);
			});

			//Open / close job drawer
			$(".item-link").off(bindTypeEnd).on(bindTypeEnd, function(e){
				var el = $(this);
				setTimeout(function () {
					if (preventOpen) return;
					if (isSwipe === true || isOpen === true) {
						isSwipe = false;
						return
					};
					isSwipe = false;
					that.toggleJobOptions(el);
				}, 30);
			});

			//Pull to refresh
			if (App.platform !== "desktop") {
				var ptrContent = App.$$('.pull-to-refresh-content');
				ptrContent.on('refresh', function (e) {
					that.refresh();
				})
			} else {
				var ptrContent = App.$$('.pull-to-refresh-content');
				App.Framework7.destroyPullToRefresh(ptrContent)
			}


			//If showing unsaved items
            if ( this.options.unsaved ) {
            	$(".unsaved .finish ").off(bindTypeEnd).on(bindTypeEnd, function () {
            		Backbone.history.navigate("#save-all", {trigger: true, replace: true});
            	})
            	$(".unsaved .cancel a").off(bindTypeEnd).on(bindTypeEnd, function () {
            		App.Framework7.confirm("Any unsaved time will return to what is currently saved on Chase." , 'Are you sure?', function () {
            			Backbone.history.navigate("#purge-all", {trigger: true, replace: true});
            		});
            	})
            }

            $(".clock").click(function () {
            	var target = $(this).closest("li")
            	that.stopTiming(target)
            })

            //disable swipe out on slide
            $(".timesheet-item input").off(bindTypeStart).on(bindTypeStart, function (){
            	$(this).closest("li").removeClass("swipeout");
            })
            $(".timesheet-item input").off(bindTypeEnd).on(bindTypeEnd, function (){
            	$(this).closest("li").addClass("swipeout");
            })


            // Favourite Job
			$(".favourite").off(bindTypeEnd).on(bindTypeEnd, function (){
				preventOpen = true;
				that.favourite($(this).closest("li"));
				setTimeout(function () {
					preventOpen = false;
				}, 50)
			})

			$(".timesheet-item").off("mouseover").on("mouseover", function () {
				$(this).addClass("hover");
			})
			$(".timesheet-item").off("mouseout").on("mouseout", function () {
				$(this).removeClass("hover");
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


		///////////////////////////////////////
		////	Single job functions
		///////////////////////////////////////

		// Open or close job drawer - show / hide slider
		toggleJobOptions: function (el) {			
			var slider = el.parent().find(".timer-slider");
			slider.slideToggle();
			slider.toggleClass("isOpen");

			if (slider.hasClass("isOpen")) {
				slider.closest("li").removeClass("swipeout").addClass("hover");
			} else {
				slider.closest("li").addClass("swipeout").removeClass("hover");
			}
		},

		//Get job ID from any li child
		getId: function (el) {
			if (!(el instanceof jQuery)) el = $(el);
			var id = el.closest("li").attr("data-for") || el.closest("li").attr("id");
			return id;
		},


		completeJob: function (target) {
			var that = this;

			var id = this.getId(target);

			if (target.hasClass("is-timing")) {
				App.Framework7.alert("Stop timing if you want to complete this task.", "You're still timing");
				return;
			} 
			
			this.collection.get(id).completeJob();
			
			if (!target.hasClass("complete")) {
				if ($(".complete").length < 1) {
					$(".timesheets-list").append('<li class="item-divider complete-divider">Completed jobs<span class="close-completed"></span></li>');
				}

				target.slideUp(400, function(){
					target.addClass("complete");
					var newTarget = target.clone();
					target.remove();

					newTarget.insertAfter($(".complete-divider"))
					newTarget.find(".timer-slider").hide().removeClass("isOpen")
					that.initEvents();
				});

			} else {
				target.slideUp(400, function(){
					target.removeClass("complete");
					var newTarget = target.clone();
					target.remove();

					newTarget.insertBefore($(".complete-divider"));
					newTarget.find(".timer-slider").hide().removeClass("isOpen");
					newTarget.slideDown();
					if ($(".complete").length < 1) {
						$(".complete-divider").slideUp();
					}
					that.initEvents();
				});
			}
		
		},



		favourite: function (target) {
			var id = this.getId(target);
			this.collection.get(id).favourite();
			target.toggleClass("pinned")
		},


		///////////////////////////////////////
		////	Timing Visuals
		///////////////////////////////////////
		getTotalTime: function () {
			var total = 0;

			for (var i = 0; i < this.collection.models.length; i ++) {
				total += parseInt(this.collection.models[i].get("todaysTime"));
			}

			return this.unparseTime(total);
		},

		// Minutes -> 00:00
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

		updateTimeVisual: function (e) {
			var that = this;
			var time = e.get("todaysTime");
			var parsed = that.unparseTime(time);
			var target = $("#" + e.id).find(".job-timer .time").text(parsed);
		},



		///////////////////////////////////////
		////	SLIDERS
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
			var that = this;

			if (target === null || model === null) return;
			var formData = App.Framework7.formToJSON('#form-' + target);
			var value = formData.slider;
  			model.set("todaysTime", parseInt(value));

  			//Update
  			clearTimeout($.data(that, 'modelTimer'));
		    $.data(that, 'modelTimer', setTimeout(function() {
		    	model.sendUpdate();
		    }, 1000));
		},


		///////////////////////////////////////
		////	Timer
		///////////////////////////////////////

		//Decides to either start or stop timing
		swipeTimer: function (target) {
			var that = this;

			if ($(".is-timing").length > 0 && this.getId(target) !== this.getId($(".is-timing").eq(0)) ) {
				App.Framework7.swipeoutClose(target);
				App.Framework7.alert("Slow down there, one job at a time.", "You're already timing");
				return;
			} 

			if (this.getId(target) === this.getId($(".is-timing").eq(0))) {
				App.Framework7.swipeoutClose(target);
				that.stopTiming(target);
				
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
			                that.startTiming(target, 1440);
			            }
			        },
			        {
			            text: '8 Hours',
			            //color: 'yellow',
			            onClick: function () {
			                that.startTiming(target, 480)
			            }
			        },
			        {
			            text: '4 Hours',
			            //color: 'blue',
			            onClick: function () {
			                that.startTiming(target, 240)
			            }
			        },
			        {
			            text: '2 Hours',
			            //color: 'blue',
			            onClick: function () {
			                that.startTiming(target, 120)
			            }
			        },
			        {
			            text: '1 Hour',
			            //color: 'blue',
			            onClick: function () {
			                that.startTiming(target, 60)
			            }
			        },
			        {
			            text: '30 Minutes',
			            //color: 'blue',
			            onClick: function () {
			                that.startTiming(target, 30)
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

			//Set model
			that.collection.get(id).set("isTiming", true);
			that.collection.get(id).set("maxTiming", max);
			that.collection.get(id).set("timingStamp", new Date().getTime());

			//Save timestamp
			that.collection.get(id).startTiming();

			//Disable other functionality
			target.find(".swipeout-actions-left").addClass("swipeout-actions-left-disabled").removeClass("swipeout-actions-left");
			target.find(".range-slider input").prop('disabled', true);
			target.addClass("is-timing");

			//Update visuals
			this.timingInterval();
		},

		stopTiming: function (target) {
			var id = this.getId(target);

			this.collection.get(id).stopTiming();
			target.removeClass("is-timing");
			target.find(".range-slider input").prop('disabled', false);
			target.find(".swipeout-actions-left-disabled").removeClass("swipeout-actions-left-disabled").addClass("swipeout-actions-left");

			clearInterval(this.timingInterval);

			return false;
		},

		timingInterval: function (target) {
			var that = this;
			var id = this.getId(target);

			this.timingInterval = setInterval(function(){
				var current = that.collection.get(id).get("todaysTime")
				that.collection.get(id).set("todaysTime", current + 1)
				$(".total-time").text(that.getTotalTime());
			}, 60000)
		}



		
	});

	return IndexView;

});