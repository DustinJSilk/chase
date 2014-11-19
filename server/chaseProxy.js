var express = require('express');
var app = express();
var config = require('./config.json');
var request = require('request');
var Q = require('q');
var bodyParser = require('body-parser');
var clientResponser = require('./clientResponser.js');
var database = require('./database.js');
var functions = require('./functions.js');
var Ext = require('./json.js');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




var login = function (user) {
	var deferred = Q.defer();

	request.post(
	    config.chase_url + '/ChaseMachine/Login.aspx',
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
	    config.chase_url + '/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    { 
	    	form: { 
	    		req: 'get'
	    	}, 
	    	headers: {
	    		Cookie: user.cookies
	    	},
	    	timeout: 20000
	    },
	    function (error, response, body) {
	    	if (error && error.code === "ETIMEDOUT") {
	    		user.rejected = 408;
	    		deferred.reject(user);

	    	} else if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);

	    	} else if (response.statusCode === 302) {
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


var saveAllTimesheets = function (user) {
	var deferred = Q.defer();

	var body = "req=settsgrid&modifiedRecords=" + functions.jsonToURI(user.updateSheets) + "&deletedLineIDs=%5B%5D";

	request.post(
	    config.chase_url + '/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    {
	    	body: body,
	    	headers: {
	    		Cookie: user.cookies,
	    		'Content-Type': 'application/x-www-form-urlencoded'
	    	}
	    },
	    function (error, response, body) {
	    	if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);
	    	} else {
		    	var decoded = Ext.Ext.JSON.decode(body);

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





var searchJobNumber = function (user) {
	var deferred = Q.defer();

	request.post(
	    config.chase_url + '/ChaseMachine/ExtJs/Ajax/Tools/QuickSearch.ashx',
	    { 
	    	form: { 
	    		req: 'loadWizardQuickSearchResults',
	    		value: user.searchTerm,
	    		isActiveJobsOnly: true,
	    		isElementSearch: true,
	    		formID: 2
	    	}, 
	    	headers: {
	    		Cookie: user.cookies
	    	}
	    },
	    function (error, response, body) {
	    	if (!response) {
	    		user.rejected = 503;
	    		deferred.reject(user);

	    	} else if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);

	    	} else {
		    	var decoded = Ext.Ext.JSON.decode(body);
		    	user.results = decoded.dataForQuickSearch[0][1];

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




var grabJob = function (user) {
	var deferred = Q.defer();

	request.post(
	    config.chase_url + '/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    { 
	    	form: { 
	    		req: 'get_jobno_name',
	    		jobno: user.jobNumber,
	    		configid:1
	    	}, 
	    	headers: {
	    		Cookie: user.cookies
	    	}
	    },
	    function (error, response, body) {
	    	if (!response) {
	    		user.rejected = 503;
	    		deferred.reject(user);

	    	} else if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);

	    	} else {
		    	var decoded = Ext.Ext.JSON.decode(body);
		    	user.results = decoded;

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






var saveNewLine = function (user) {
	var deferred = Q.defer();

	request.post(
	    config.chase_url + '/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx',
	    { 
	    	form: { 
	    		req: 'save_line_item',
	    		currentDate: functions.formatDate(new Date()),

	    	}, 
	    	headers: {
	    		Cookie: user.cookies
	    	}
	    },
	    function (error, response, body) {
	    	if (!response) {
	    		user.rejected = 503;
	    		deferred.reject(user);

	    	} else if (response.statusCode === 302) {
	    		user.rejected = 302;
	    		deferred.reject(user);

	    	} else {
		    	var decoded = Ext.Ext.JSON.decode(body);
		    	user.results = decoded.dataForQuickSearch;

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
  getTimesheets: getTimesheets,
  saveAllTimesheets: saveAllTimesheets,
  searchJobNumber: searchJobNumber,
  grabJob: grabJob
}











