define(["app", "marionette", "text!templates/login.html"], function (App, Marionette, LoginTemplate) {

	var LoginView = Backbone.Marionette.ItemView.extend({

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

			$.ajax({
				url: App.urlRoot + "/login",
				type: "POST",
				data: {
					em: em,
					pw: pw
				},
				success: function (data) {
					App.userID = data.id;
					localStorage.setItem("userID", data.id);
					Backbone.history.navigate('/index', { trigger:true, replace: true })
				},
				error: function () {
					console.log("error");
				}
			});
		}
	});

	return LoginView;

});