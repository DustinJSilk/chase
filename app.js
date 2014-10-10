var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var chaseProxy = require('./chaseProxy.js');
var database = require('./database.js');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




/* LOGIN - pw: password, em: username; */
app.use('/login', function(req, res) {
	var user = {req: req, res: res}
	chaseProxy.login(user);
});

/* GET timesheets - id: _id */
app.use('/timesheets', function(req, res) {
	var user = {req: req, res: res}
	var getTimeSheets = chaseProxy.getTimesheets
	database.getUserCookies(user, getTimeSheets);
});





/*
	Start server
*/
console.log("listening on 7501")
app.listen(7501);



