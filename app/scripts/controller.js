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
                        App.page.show(new IndexView({collection: App.Jobs}));
                    },
                    error: function (err, xhr, o) {
                        if (err.status === 401) {
                            App.Framework7.loginScreen();
                        }
                    }
                })
            })
        },

        test: function () {
            App.mainView.router.load({
                pageName: "test"
            })
        },

        job: function (id) {
            require([ "app", "views/job"], function (App, JobView) {
                var job = App.Jobs.get(id);
                App.job.show(new JobView({model: job}));
            });
        }

    }

    return controller;

});