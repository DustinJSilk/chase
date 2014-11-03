define(["app", "marionette", "text!templates/login.html"], function (App, Marionette, LoginTemplate) {

	var LoginView = Backbone.Marionette.ItemView.extend({

		className: "view",

		template: function(){
			return _.template(LoginTemplate);
		},

		events: {
			"click #submit" : "login"
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
					$(".login a").removeClass("loading").find("span").eq(0).text("Success!");

					App.userID = data.id;
					localStorage.setItem("userID", data.id);
					Backbone.history.navigate('/', { trigger:true, replace: true });
					Backbone.history.navigate('/index', { trigger:true, replace: true });
					App.Framework7.closeModal("#login-screen")
				},
				error: function () {
					$(".login a").removeClass("loading").find("span").eq(0).text("Oops! Something went wrong.");
					setTimeout(function () {
						$(".login a").find("span").eq(0).text("Login");
					}, 2000)
				}
			});
		}
	});

	return LoginView;

});