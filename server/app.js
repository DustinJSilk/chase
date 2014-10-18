var express = require('express');
var app = express();
var Q = require('q');
var bodyParser = require('body-parser');
var chaseProxy = require('./chaseProxy.js');
var database = require('./database.js');
var clientResponser = require('./clientResponser.js');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




/* LOGIN - pw: password, em: username; */
app.use('/login', function(req, res) {
	var user = {req: req, res: res};
	user.username = user.req.body.em;
	user.password = user.req.body.pw;

	var promise = chaseProxy.login(user)
		.then(function (data){
			return database.insertDetails(data);
		})
		.then(function (data){
			return clientResponser.login(data)
		})
});




/* GET timesheets - id: _id */
app.use('/timesheets', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	var promise = database.checkUnsavedTimesheets(user)
		.fail(function (data) {
			clientResponser.timeSheets(data);
		})
	.then(function (data) {
		return database.getUserCookies(data);
	})
	.then(function (data) {
		return chaseProxy.getTimesheets(data);
	})
		.fail(function (data) {
			if (data.rejected === 302) {
				var relogin = database.fetchAuth(data)
					.then(function (data) {
						return chaseProxy.login(data)
					})
					.then(function (data){
	            		return database.insertDetails(user);
					})
					.then(function (data){
						return chaseProxy.getTimesheets(data)
					})
					.then(function (data){
						return database.saveTimeSheets(data);
					})
					.then(function (data) {
						clientResponser.timeSheets(data);
					});
			}
		})
	.then(function (data) {
		return database.saveTimeSheets(data);
	})
	.then(function (data) {
		clientResponser.timeSheets(data);
	});
});


/* Change Colour - id: _id, job: _id, colour: {{'red', 'blue', 'yellow', null}} */
app.use('/colour', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	user.jobID = req.body.job;
	user.colour = req.body.colour;

	var promise = database.colour(user)
		.then(function (data){
			return clientResponser.success(data);
		})

});





/*
	Start server
*/
console.log("listening on 7501")
app.listen(7501);



