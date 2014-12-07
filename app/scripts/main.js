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

    //App.urlRoot = "http://silkysmooth.machineagency.co.za";
    App.urlRoot = "http://127.0.0.1:7501";

    App.os = "mac";
    // App.os = "windows";
    //App.os = "ios";
    // App.os = "android";
    
    App.platform = "desktop"
    //App.platform = "mobile"

    $('html').addClass(App.os)
    $('html').addClass(App.platform)

    App.Framework7 = new Framework7({
        dynamicNavbar: true,
        domCache: true,
        router: false
    });
    App.$$ = Dom7;
    App.mainView = App.Framework7.addView('.view-main');


    if (localStorage.getItem("userID") === null) {
        App.login.show(new LoginView());
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


    var bindTypeEnd = (App.platform === "desktop") ? "mouseup" : "touchend";
    var bindTypeStart = (App.platform === "desktop") ? "mousedown" : "touchstart";

    // Show Complete
    function toggleCompleted () {
        $(".timesheet-item.complete").slideToggle();
        $(".complete-divider").slideToggle();

        if ( !$("#show-completed").hasClass("showing") ) {
            $("#show-completed").html('<span class="icon">&#xe603;</span>Hide completed').addClass("showing");
        } else {
            $("#show-completed").html('<span class="icon">&#xe603;</span>Show completed').removeClass("showing");
        }
        App.Framework7.closePanel();
        $(".close-completed").off(bindTypeEnd).on(bindTypeEnd, toggleCompleted);

        // $(".page-content").animate({
        //     scrollTop: $(".complete-divider").prev().offset().top + $(".complete-divider").prev().height() + "px"
        // }, 600)
        
    }
    $("#show-completed").on(bindTypeEnd, toggleCompleted);
    
            
});

