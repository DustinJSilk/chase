define(["app"], function (App) {
    var controller = {
        // index: function () {
        //     require([ "app", "views/index" ], function (App, IndexView) {
        //         App.page.show(new IndexView())
        //     })
        // },

        login: function () {
            require([ "app", "views/login" ], function (App, LoginView) {
                App.page.show(new LoginView());
            })
        }

    }

    return controller;

});