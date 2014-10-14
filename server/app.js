var express = require('express');
var app = express();
var Q = require('q');
var bodyParser = require('body-parser');
var chaseProxy = require('./chaseProxy.js');
var database = require('./database.js');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




/* LOGIN - pw: password, em: username; */
app.use('/login', function(req, res) {
	var user = {req: req, res: res};
	chaseProxy.login(user);
});

/* GET timesheets - id: _id */
app.use('/timesheets', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	var promise = database.checkUnsavedTimesheets(user)
	.then(function (data) {
		console.log("1")
		return database.getUserCookies(data);
	})
	.then(function (data) {
		console.log("2")
		return chaseProxy.getTimesheets(data);
	})
	.then(function (data) {
		console.log("3")
		//return database.saveTimeSheets(data);
	})
	.then(function (data) {
		console.log("4")
		return clientResponser.timeSheets(data);
	});

});





/*
	Start server
*/
console.log("listening on 7501")
app.listen(7501);



