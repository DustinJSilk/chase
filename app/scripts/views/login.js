define(["app", "marionette", "text!templates/login.html"], function (App, Marionette, LoginTemplate) {

	var LoginView = Backbone.Marionette.ItemView.extend({

		className: "view",

		template: function(){
			return _.template(LoginTemplate);
		},

		events: {
			"click #submit" : "login",
			"click #login-continue": "loginContinue"
		},

		onShow: function () {

		},

		login: function () {
			var that = this;

			var em = $("#em").val();
			var pw = $("#pw").val();

			$(".login a").addClass("loading");

			$.ajax({
				url: App.urlRoot + "/login",
				type: "POST",
				data: {
					em: em,
					pw: pw
				},
				success: function (data) {
					//$(".login a").removeClass("loading").find("span").eq(0).text("Success!");

					App.userID = data.id;
					localStorage.setItem("userID", data.id);

					if (data.userType === null) {
						that.showUserTypes();
						return;
					}

					Backbone.history.navigate('/', { trigger:true, replace: true });
					Backbone.history.navigate('/index', { trigger:true, replace: true });
					App.Framework7.closeModal("#login-screen");
				},
				error: function () {
					$(".login a").removeClass("loading").find("span").eq(0).text("Oops! Something went wrong.");
					setTimeout(function () {
						$(".login a").find("span").eq(0).text("Login");
					}, 2000)
				}
			});
		},

		showUserTypes: function () {
			$.ajax({
				url: App.urlRoot + "/getjobtypes",
				type: "POST",
				data: {id: App.userID},
				success: function (data) {
					var select = $(".user-type-select select");
					for (var i = 0; i < data.data.length; i ++) {
						select.append("<option value='" + data.data[i].tasktypeid + "'>" + data.data[i].tasktype + "</option>");
					}

					//fade out login - fade in job select
					$(".login").fadeOut(400, function () {
						$(".user-type-select").fadeIn(400, function () {

						})
					});
				}
			});
			
		},

		loginContinue: function () {
			if ($(".user-type-select select").val() !== null && $(".user-type-select select").val() !== undefined) {
				$.ajax({
					url: App.urlRoot + "/setjobtype",
					type: "POST",
					data: {id: App.userID, userTypeId: $(".user-type-select select").val()},
					success: function (data) {
						Backbone.history.navigate('/', { trigger:true, replace: true });
						Backbone.history.navigate('/index', { trigger:true, replace: true });
						App.Framework7.closeModal("#login-screen");
					}
				});
			}
		}
	});

	return LoginView;

});