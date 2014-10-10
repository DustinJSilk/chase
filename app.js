var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var mongo = require('mongojs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var tempUsers = [];





/*
	Database Calls
*/

var uri = "chase";
var users = mongo.connect(uri, ["users"]).users;

var database = {

	createUser: function (tempId) {
		var u = tempUsers[tempId];

		return users.insert({
			username: u.req.body.em,
			password: u.req.body.pw,
			cookies: u.req.body.cookies
		}, function(err, inserted){
		    responder.login(inserted._id, tempId);
		});
	},

	updateUserCookies: function (id, cookies) {

	},

	updateUserLoginDetails: function (id, username, password) {

	},

	getUserCookies: function () {
		return [ "ASP.NET_SessionId=oxdkulxqkmi5rvpzulmkrth3; path=/", "LastSelectedUser=280; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastSelectedConfig=1; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastEmail=dustin.silk; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "rememberme=True; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastPwd=Machine031; expires=Sun, 09-Oct-2044 20:51:49 GMT; path=/ChaseMachine", "ChaseAuth=1AA72618F7A2E2749A81C6E6E169B7FE7097CFEF3DE4C9F98A0F9392D841BC5FA64433EE482DC77CCA20BB70BE7BCBB67431EB6937D5E9B7F6B9BF85FDDCE560268EE49982920E110C5DFD585CDE0E2A5B55C7471A4A8361B75E2BC609197C486B502A3BE9DD6A11C813A51C8567C4BFE304DA087EE2ABC1A84A8764C4D08679347AB693B2039B364373B7E66EA1A9B8832F7C050110756E8147AF9AA53F74D1; path=/ChaseMachine" ];
	}
}







/*
	Client Responder
*/
var responder = {
	login: function (id, tempId) {
		tempUsers[tempId].res.header('Access-Control-Allow-Origin', '*');
	    tempUsers[tempId].res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	    tempUsers[tempId].res.header('Access-Control-Allow-Headers', 'Content-Type');
        tempUsers[tempId].res.json({ success: true, id: id });

        //remove temporary data
        tempUsers.splice(tempId, 1);
	}
}





/*
	Chase Proxy
*/
var chaseProxy = {

	login: function (tempId) {
		var u = tempUsers[tempId];

		request.post(
		    'http://192.168.1.53/ChaseMachine/Login.aspx',
		    { form: { req: 'auth',  cid: '1', em: u.req.body.em, pw: u.req.body.pw, rm: true} },
		    function (error, response, body) {
		    	var success = (body.indexOf("true") > -1 && body.indexOf("ChaseMachine") > -1);

		        if (!error && response.statusCode == 200 && success === true) {
		        	//save data
		        	u.cookies = response.headers['set-cookie'];
		        	console.log(u.cookies);
		            database.createUser(tempId);

		        //Handle errors
		        } else if (!error && response.statusCode == 200 && success === false) {
		        	res.json({success: false, error: "Couldn't login with those details"});

		        } else if (!error && !response.statusCode == 200) {
		        	res.json({success: false, error: "Couldn't connect to Chase server"});

				} else if (error) {
		        	res.json({success: false, error: "An error 500"});
		        }
		    }
		);
	},


	getTimesheets: function (tempId) {
		var u = tempUsers[tempId];


		//create cookie jar
		var cookieJar = request.jar()
		
		for (var i = 0; i < database.getUserCookies().length; i ++) {
			var cookie = request.cookie(database.getUserCookies()[i]);
			cookieJar.setCookie(cookie, 'http://192.168.1.53');
			console.log(database.getUserCookies()[i])
		}
		

		request.post(
		    'http://192.168.1.53/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
		    { form: { req: 'get'}, jar: cookieJar },
		    function (error, response, body) {
		    	u.res.json({body: body});

		        if (!error && response.statusCode == 200 && success === true) {

		        } else if (!error && response.statusCode == 200 && success === false) {
		        	res.json({success: false, error: "Couldn't login with those details"});

		        } else if (!error && !response.statusCode == 200) {
		        	res.json({success: false, error: "Couldn't connect to Chase server"});

				} else if (error) {
		        	res.json({success: false, error: "An error 500"});
		        }
		    }
		);
	}

}





/*
	LOGIN

	$.ajax({
	  type: "POST",
	  url: "http://localhost:7501/login",
	  data: {em: "username", pw: "password"},
	  success: function (res) {console.log(res)}
	})
*/

app.use('/login', function(req, res) {

	var tempId = tempUsers.length;
	tempUsers.push({req: req, res: res});
	chaseProxy.login(tempId);

});


/*
	GET timesheets
*/

app.use('/timesheets', function(req, res) {

	var tempId = tempUsers.length;
	tempUsers.push({req: req, res: res});
	chaseProxy.getTimesheets(tempId);
	
});


/*
	Start server
*/
console.log("listening")
app.listen(7501);