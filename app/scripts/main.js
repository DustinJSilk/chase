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

require([ "app"], function( App) {

    App.urlRoot = "http://dev.apollo:7501";

    if (localStorage.userID !== null && localStorage.userID !== undefined) {
        window.location.hash = "#index";
        App.userID = localStorage.userID;
    } else {
        window.location.hash = "#login";
    }

    App.start();

});

