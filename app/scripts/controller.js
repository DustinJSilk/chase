define(["app"], function (App) {
    var controller = {
        index: function () {
            require([ "app", "views/index", "collections/timesheets" ], function (App, IndexView, TimesheetsCollection) {
                $.ajax({
                    url: App.urlRoot + "/timesheets",
                    type: "POST",
                    data: {id: App.userID},
                    success: function (data) {
                        App.Jobs = new TimesheetsCollection(data.timeSheets.sheets)
                        
                        if (data.timeSheets.unsaved === false) {
                            App.page.show(new IndexView({collection: App.Jobs, unsaved: false }));
                        } else {
                            Backbone.history.navigate("#unsaved", {trigger: true, replace: true});
                        }
                        
                    },
                    error: function (err, xhr, o) {
                        if (err.status === 401) {
                            App.Framework7.loginScreen();
                        } else {
                            App.Framework7.alert("Oh no! Someone broke the internet.", 'Connection error');
                        }
                    }
                })
            })
        },

        job: function (id) {
            require([ "app", "views/job"], function (App, JobView) {
                var job = App.Jobs.get(id);
                App.job.show(new JobView({model: job}));
            });
        },

        addNew: function () {
            require([ "app", "views/add-new", "models/add-new"], function (App, AddNewView, AddNewModel) {
                $("#add-new").html("")
                App.addNew.show(new AddNewView({model: new AddNewModel}));
            });
        },

        saveAll: function () {
            $.ajax({
                url: App.urlRoot + "/saveall",
                type: "POST",
                data: {id: App.userID},
                success: function (data) {
                    Backbone.history.navigate("#index", {trigger: true, replace: true});
                    $(".unsaved").css({"top": "100%"});
                    setTimeout(function () {
                        $(".unsaved #unsaved").html("")
                    }, 800)
                },
                error: function (err, xhr, o) {
                    if (err.status === 401) {
                        App.Framework7.loginScreen();
                    } else {
                        App.Framework7.alert("Oh no! Someone broke the internet.", 'Connection error');
                    }
                }
            })
        },

        unsaved: function () {
            require([ "app", "views/index"], function (App, IndexView) {
                App.unsaved.show(new IndexView({collection: App.Jobs, unsaved: true}));
            });
        }

    }

    return controller;

});