require.config({
	baseURL: 'scripts',
    paths: {
        "jquery":  "lib/jquery",
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "marionette": 'lib/backbone.marionette',
        "templates": "../templates",
        "text": "lib/text"
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'Marionette'
        },
        waitSeconds: 15
    }
});

require([ "app", "router", "views/login"], function(App, AppRouter, LoginView) {

    App.urlRoot = "http://dev.apollo:7501";
    App.os = "mac";
    // App.os = "windows";
    // App.os = "ios";
    // App.os = "android";

    App.Framework7 = new Framework7({
        dynamicNavbar: true,
        domCache: true,
        router: false
    });
    App.$$ = Dom7;
    App.mainView = App.Framework7.addView('.view-main');

    if (localStorage.userID === null && localStorage.userID === undefined && localStorage.userID.length > 0) {
        App.Framework7.loginScreen();
    } else {
        App.userID = localStorage.userID;
        window.location.hash = "#index";
    }

    App.addInitializer(function (options) {
        var Router = new AppRouter();
        Backbone.history.start();
    });

    App.start();

    App.login.show(new LoginView());
            
});

