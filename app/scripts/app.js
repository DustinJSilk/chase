define(["marionette"], function (Marionette) {

    // set up the app instance
    var MyApp = new Marionette.Application();

    // configuration, setting up regions, etc ...
    MyApp.addRegions({
        page: "#page",
        login: "#login-screen",
        job: "#job",
        addNew: "#add-new"
    });
    
    // export the app from this module
    return MyApp;
});