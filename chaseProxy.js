var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var clientResponser = require('./clientResponser.js');
var database = require('./database.js');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




exports.login = function (user) {
	request.post(
	    'http://192.168.1.53/ChaseMachine/Login.aspx',
	    { form: { req: 'auth',  cid: '1', em: user.req.body.em, pw: user.req.body.pw, rm: true} },
	    function (error, response, body) {

	    	var success = (body.indexOf("true") > -1 && body.indexOf("ChaseMachine") > -1);

	        if (!error && response.statusCode == 200 && success === true) {
	        	user.cookies = response.headers['set-cookie'];

	        	var responder = clientResponser.login;
	            database.createUser(user, responder);

	        //Handle errors
	        } else if (!error && response.statusCode == 200 && success === false) {
	        	user.res.json({success: false, error: "Couldn't login with those details"});

	        } else if (!error && !response.statusCode == 200) {
	        	user.res.json({success: false, error: "Couldn't connect to Chase server"});

			} else if (error) {
	        	user.res.json({success: false, error: "An error 500"});
	        }
	    }
	);
};


exports.getTimesheets = function (user) {

	request.post(
	    'http://192.168.1.53/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    { 
	    	form: { 
	    		req: 'get'
	    	}, 
	    	headers: {
	    		Cookie: user.cookie
	    	}
	    },
	    function (error, response, body) {
	    	user.res.json({body: body, code: response.statusCode});

	        if (!error && response.statusCode == 200 && success === true) {

	        } else if (!error && response.statusCode == 200 && success === false) {
	        	user.res.json({success: false, error: "Couldn't login with those details"});

	        } else if (!error && !response.statusCode == 200) {
	        	user.res.json({success: false, error: "Couldn't connect to Chase server"});

			} else if (error) {
	        	user.res.json({success: false, error: "An error 500"});
	        }
	    }
	);
}

