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

// var uri = "chase";
// var users = mongo.connect(uri, ["users"]).users;

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
		//Cookie: ys-TimeSheetAddLineBy=s%3ATimeSheetAddByJobNo; ys-gridSettings=o%3AMy%20Tasks%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Afinishdate%25255EsortOrder%25253Ds%2525253ADESC%5ETimeSheets%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Aclient%25255EsortOrder%25253Ds%2525253Aasc%255EitemOrderSettings%253Do%25253AitemOrder%25253Da%2525253A; 
		var data = ["ys-TimeSheetAddLineBy=s%3ATimeSheetAddByJobNo", "ys-gridSettings=o%3AMy%20Tasks%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Afinishdate%25255EsortOrder%25253Ds%2525253ADESC%5ETimeSheets%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Aclient%25255EsortOrder%25253Ds%2525253Aasc%255EitemOrderSettings%253Do%25253AitemOrder%25253Da%2525253A", "LastSelectedUser=280", "LastSelectedConfig=1", "LastEmail=dustin.silk", "rememberme=True", "LastPwd=Machine031", "ChaseAuth=54DD3DF9AB806DF8DD62B689562135FC1265FAB0A5008F363247835DE373109A1EDB6F7234DD4BBE6140AAB609A26231FA23723FBF863C39625EE5E04826328EF0F09CA71C7F147401092B20E6ABC8E62692A7EB0CBAF5934DB8E0A616CA591157B7529BD5BA804BB50D8A046505DEB2471AF99D1552E51E953C11E0E80AC923F4F0D2E75EEF688C3BC866ED1ECA9077AF71D2470D9BE94113DCAEE1C454AAB1; ASP.NET_SessionId=nnu5enwx1ws3mlke3wngiqwg"];
		//var data = [ "ASP.NET_SessionId=oxdkulxqkmi5rvpzulmkrth3; path=/", "LastSelectedUser=280; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastSelectedConfig=1; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastEmail=dustin.silk; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "rememberme=True; expires=Sun, 09-Oct-2044 20:51:47 GMT; path=/ChaseMachine", "LastPwd=Machine031; expires=Sun, 09-Oct-2044 20:51:49 GMT; path=/ChaseMachine", "ChaseAuth=1AA72618F7A2E2749A81C6E6E169B7FE7097CFEF3DE4C9F98A0F9392D841BC5FA64433EE482DC77CCA20BB70BE7BCBB67431EB6937D5E9B7F6B9BF85FDDCE560268EE49982920E110C5DFD585CDE0E2A5B55C7471A4A8361B75E2BC609197C486B502A3BE9DD6A11C813A51C8567C4BFE304DA087EE2ABC1A84A8764C4D08679347AB693B2039B364373B7E66EA1A9B8832F7C050110756E8147AF9AA53F74D1; path=/ChaseMachine" ];
		
		var cookie = "Cookie: ";

		for (var i = 0; i < data.length; i ++) {
			cookie += data[i] + "; ";
		}
		return cookie;
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

		var cookie = database.getUserCookies();

		request.post(
		    'http://192.168.1.53/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
		    { 
		    	form: { 
		    		req: 'get'
		    	}, 
		    	headers: {
		    		Cookie: cookie
		    	}
		    },
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









/*

Ive started diving into Nodejs. Now that my app is growing a bit large my code seems to be getting a little messy. On the front end it was fine because there wasnt all that many asynchronous events all waiting and depending on each other (Backbone and marionette helped a lot with that).

So now that everything is event driven I'm unsure of how to pass data around effectively and cleanly when receiving multiple requests at once.

So when I receive an Http request (with express) I do a little work and then make an asynchronous call to say, another server (using request). I could easily just have it run in the callback like so:

    app.use('/get', function(req, res) {
        request.post('http://url', data, function (error, response, body){
            res.json({body: body});
        });
    });

That is fine for something small as we can just wait for the second event to finish and then pass back the response to the original request response. But now if we had to add another asynchronous event to the mix to say, a database. Then we're in Callback Hell. 

So to combat callback hell (on the front end) I'd make an object to hold all the functions and their callbacks then have a controller that calls the functions as they're needed. this would also work fine here as we can just pass the data we need through the functions. But as the data grows

*/