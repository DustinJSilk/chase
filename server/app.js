var express = require('express');
var app = express();
var Q = require('q');
var bodyParser = require('body-parser');
var chaseProxy = require('./chaseProxy.js');
var database = require('./database.js');
var clientResponser = require('./clientResponser.js');
var functions = require('./functions.js');


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
			console.log("inserting")
			return database.insertDetails(data);
		})
		.then(function (data){
			console.log("checking")
			return database.checkUserType(data);
		})
		.then(function (data){
			console.log("responding")
			return clientResponser.login(data)
		})
});


/* getjobtypes - id */
app.use('/getjobtypes', function(req, res) {
	var user = {req: req, res: res};

	user.id = req.body.id;

	if (user.id === undefined || user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	var promise = (function getJobTypes () {
		return database.getUserCookies(user)
		.then(function (data){
			return chaseProxy.getJobTypes(data)
		})
			.fail(function (data) {
				if (data.rejected === 302) {
					var relogin = database.fetchAuth(data)
						.then(function (data) {
							return chaseProxy.login(data)
						})
						.then(function (data){
		            		return database.insertDetails(data);
						})
						.then(function (data){
							return promise.call();
						}).end();
				} else if (data.rejected === 408) {
					var timeout = clientResponder.timeout(data).end();
					return;
				}
			})
		.then(function (data){
			return clientResponser.returnData(data)
		})
	});

	promise.call();
});



app.use('/setjobtype', function(req, res) {
	var user = {req: req, res: res};

	user.id = req.body.id;
	user.userTypeId = req.body.userTypeId;

	if (user.id === undefined || user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	var promise = (function setJobType () {
		return database.setJobType(user)
		.then(function (data){
			return clientResponser.success(data)
		})
	});

	promise.call();
});




/* GET timesheets - id: _id */
app.use('/timesheets', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	if (user.id === undefined || user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	var promise = (function getTimesheets () {
			return database.getUserCookies(user)
			.fail(function (data) {
				clientResponser.relogin(data);
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
		            		return database.insertDetails(data);
						})
						.then(function (data){
							return promise.call();
						}).end();
				} else if (data.rejected === 408) {
					var timeout = clientResponder.timeout(data).end();
					return;
				}
			})
		.then(function (data) {
			return database.saveTimeSheets(data);
		})
		.then(function (data) {
			return database.updateCurrentDates(data);
		})
		.then(function (data) {
			// Return timesheets
			clientResponser.timeSheets(data);
		});
	});

	promise.call();
});



/* POST Update single timesheet (locally) - id: _id, todaysTime: [time in minutes], job: _id */
app.use('/updatesingle', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.job = {
		id: req.body.job,
		appTime: req.body.todaysTime
	}

	var promise = database.updateSingleJob(user)
	.then(function (data) {
		return clientResponser.updatedJob(data);
	})
	.fail(function (data) {
		clientResponser.couldntUpdate(data);
	})

});


/* POST timesheets - id: _id */
app.use('/saveall', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	var promise = database.getAllTimesheets(user)
	.then(function (data) {
		return database.getUserCookies(data);
	})
	.then(function (data) {
		return chaseProxy.saveAllTimesheets(data);
	})
		.fail(function (data) {
			console.log("failed somewhere")
			if (data.rejected === 302) {
				var relogin = database.fetchAuth(data)
					.then(function (data) {
						return chaseProxy.login(data)
					})
					.then(function (data){
	            		return database.insertDetails(user);
					})
			}
		})
	
	.then(function (data) {
		return database.updateCurrentDates(data);
	})
	.then(function (data) {
		console.log("saved all - respond")
		return clientResponser.updatedAll(data);
	});


});







/* Search */
app.use('/search', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.searchTerm = req.body.searchTerm;

	var promise = (function trySearch() {
			return database.getUserCookies(user)
			.fail(function (data) {
				clientResponser.relogin(data);
			})
		.then(function (data){
			return chaseProxy.searchJobNumber(data);
		})
		.fail(function (data) {
			if (data.rejected === 302) {
				var relogin = database.fetchAuth(data)
					.then(function (data) {
						return chaseProxy.login(data)
					})
					.then(function (data){
	            		return database.insertDetails(data);
					})
					.then(function (data){
						return promise.call();
					});

			}
		})
		.then(function (data){
			return clientResponser.searchJob(data);
		})
	});
	
	promise.call();
});




/* Search */
app.use('/grabjob', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.jobNumber = req.body.jobNumber;

	var promise = (function sequence () {
			return database.getUserCookies(user)
			.fail(function (data) {
				clientResponser.relogin(data);
			})
		.then(function (data){
			return chaseProxy.grabJob(data);
		})
			.fail(function (data) {
				console.log("rejecting")
				if (data.rejected === 302) {
					console.log("302")
					var relogin = database.fetchAuth(data)
						.then(function (data) {
							return chaseProxy.login(data)
						})
						.then(function (data){
		            		return database.insertDetails(data);
						})
						.then(function (data){
							return promise.call();
						}).end();
				}
			})
		.then(function (data){
			return clientResponser.grabJob(data);
		})
	});

	promise.call();
});




app.use('/addnew', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}


	user.job = {
		customTitle: 		req.body.customTitle,
		colour: 			req.body.colour,
		isAnonymous: 		Boolean(parseInt(req.body.isAnonymous)),
		linkedJob: 			{
			jobid: 				req.body.linkedJob.jobid,
			customerid: 		req.body.linkedJob.customerid,
			productid: 			req.body.linkedJob.productid,
			tasktypeid: 		null,
			notes: 				req.body.linkedJob.notes 
		}
	}


	// Otherwise add to chase and return. When navigating to index page it will automatically update local database
	var promise = (function sequence () {
			return database.getJobType(user)
			.then(function (data) {
				return functions.createNewLineItem(data);
			})
			.then(function (data) {
				return chaseProxy.saveNewLine(data);
			})
			.then(function (data) {
				return database.createNewJob(data);
			})
				.fail(function (data) {
					if (data.rejected === 302) {
						var relogin = database.fetchAuth(data)
							.then(function (data) {
								return chaseProxy.login(data)
							})
							.then(function (data){
			            		return database.insertDetails(data);
							})
							.then(function (data){
								return promise.call();
							});

					}
				})
			.then(function (data) {
				return clientResponser.success(data);
			});
	});

	promise.call();



});




app.use('/addanonymous', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.job = {
		customTitle: 		req.body.customTitle,
		colour: 			req.body.colour,
		isAnonymous: 		Boolean(parseInt(req.body.isAnonymous)),
		//linkedJob: 			linkedJob
	}

	// If anonymour - create anonymous timesheet and end function
	if (Boolean(parseInt(req.body.isAnonymous))) {
		var promise = database.createNewJob(user)
		.then(function (data) {
			return clientResponser.success(data);
		});

		return;
	}


});



app.use('/linkanonymous', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}


})



/* Change Colour - id: _id, job: _id, colour: {{'red', 'blue', 'yellow', null}} */
app.use('/colour', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.jobID = req.body.job;
	user.colour = req.body.colour;

	var promise = database.colour(user)
		.then(function (data){
			return clientResponser.success(data);
		})
});



/* Hide / Show - id: _id, job: _id, hide: {{true, false}} */
app.use('/togglehide', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;
	
	if (user.id.length !== 24) {
		clientResponser.relogin(user);
		return;
	}

	user.jobID = req.body.job;
	user.isHidden = req.body.hide;

	var promise = database.toggleHide(user)
		.then(function (data){
			return clientResponser.success(data);
		})
});



/* GET timesheets - id: _id */
app.use('/starttiming', function(req, res) {
	var user = {req: req, res: res};
	user.id = req.body.id;

	user.jobID = req.body.jobID;
	user.timingStamp = req.body.timingStamp;
	user.maxTiming = req.body.maxTiming;

	var promise = (function startTiming () {
			return database.startTiming(user)
		.then(function (data) {
			clientResponser.success(data);
		});
	});

	promise.call();
});



/*
	Start server
*/
console.log("listening on 7501")
app.listen(7501);



