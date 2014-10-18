define(["app"], function (App) {
    var controller = {
        index: function () {
            require([ "app", "views/index", "collections/timesheets" ], function (App, IndexView, TimesheetsCollection) {
                $.ajax({
                    url: App.urlRoot + "/timesheets",
                    type: "POST",
                    data: {id: App.userID},
                    success: function (data) {
                        var c = new TimesheetsCollection(data.timeSheets.sheets)
                        App.page.show(new IndexView({collection: c}));
                    },
                    error: function (err, xhr, o) {
                        if (err.status === 401) {
                            App.Framework7.loginScreen();
                        }
                    }
                })
            })
        }

    }

    return controller;

});