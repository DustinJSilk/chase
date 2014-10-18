var express = require('express');
var app = express();
var request = require('request');
var Q = require('q');
var bodyParser = require('body-parser');
var clientResponser = require('./clientResponser.js');
var database = require('./database.js');
var Ext = require('./json.js');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




var login = function (user) {
	var deferred = Q.defer();

	request.post(
	    'http://192.168.1.53/ChaseMachine/Login.aspx',
	    { form: { req: 'auth',  cid: '1', em: user.username, pw: user.password, rm: true} },
	    function (error, response, body) {

	    	var decoded = Ext.Ext.JSON.decode(body)

	    	var success = decoded.success;

	        if (!error && response.statusCode == 200 && success === true) {
	        	user.cookies = response.headers['set-cookie'];

	            deferred.resolve(user);

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

	return deferred.promise;
};


var getTimesheets = function (user) {
	var deferred = Q.defer();

	request.post(
	    'http://192.168.1.53/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    { 
	    	form: { 
	    		req: 'get'
	    	}, 
	    	headers: {
	    		Cookie: user.cookies
	    	}
	    },
	    function (error, response, body) {
	    	if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);
	    	} else {
		    	var decoded = Ext.Ext.JSON.decode(body);
		    	user.rawTimeSheets = decoded.lineData;

		        if (!error && response.statusCode == 200 && decoded.success === true) {
					deferred.resolve(user);

		        } else if (!error && response.statusCode == 200 && decoded.success === false) {
		        	user.res.json({success: false, error: "Failed to fetch timesheets. Chase said no!"});
		        	deferred.reject("Failed to fetch timesheets. Chase said no!")

		        } else if (!error && !response.statusCode == 200) {
		        	user.res.json({success: false, error: "Couldn't connect to Chase server"});
		        	deferred.reject("Couldn't connect to Chase server")

				} else if (error) {
		        	user.res.json({success: false, error: "An error 500"});
		        	deferred.reject("An error 500")
		        }
		    }
	    }
	);

	return deferred.promise;
}

module.exports = {
  login: login,
  getTimesheets: getTimesheets
}