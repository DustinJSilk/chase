var config = require('./config.json');
var mongo = require('mongodb');
var Q = require('q');
var clientResponser = require('./clientResponser.js');
var functions = require('./functions.js');

var users;
mongo.connect(config.database_connection, function (err, db) {
	users = db.collection('users');	
});

var insertDetails = function (user) {
	var deferred = Q.defer();

	var cookie = "";
	for (var i = 0; i < user.cookies.length; i ++) {
		cookie += user.cookies[i] + "; ";
	}
	user.cookies = cookie;

	// If user id exists update it.
	if (user.id !== undefined && user.id !== null) {
		updateUserCookies(user, deferred);

	} else {
		// First check is the inputted user name exists. If it does - update that and return its ID
		// No need to worry about security - This is only after successful login with Chase
		users.find({'username': user.req.body.em}).toArray(function (err, data) {
			if (data.length > 0) {
				user.id = data[0]._id.toHexString();
				updateUserCookies(user, deferred);
			} else {
				createUser(user, deferred);
			}
		});
	};

	return deferred.promise;
	
};


var updateUserCookies = function (user, deferred) {
	var ObjectID = mongo.ObjectID;
	var userId = ObjectID.createFromHexString(user.id);
	
	users.update({ _id: userId }, {
		$set: {cookies: user.cookies}

	}, function (err, results) {
		deferred.resolve(user);
	});

};


var createUser = function (user, deferred) {
	users.insert({
		username: user.req.body.em,
		password: user.req.body.pw,
		userType: null,
		cookies: user.cookies,
		currentDay: new Date().getDay(),
		currentDate: new Date().getDate(),
		timeSheets: []
	
	}, function (err, results){
		user.id = results[0]._id;
		deferred.resolve(user);
	});
};


var checkUserType = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		if (data.length < 1) {
			deferred.reject(user);
			return;
		}
		user.userType = data[0].userType;
		deferred.resolve(user);
	});

	return deferred.promise;
}

var setJobType = function (user) {
	var deferred = Q.defer();

	var ObjectID = mongo.ObjectID;
	var userId = ObjectID.createFromHexString(user.id);
	
	users.update({ _id: userId }, {
		$set: {userType: user.userTypeId}

	}, function (err, results) {
		deferred.resolve(user);
	});

	return deferred.promise;
};


var getJobType = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)
	
	users.find({'_id': id}).toArray(function(err, data) {
		if (data.length < 1) {
			deferred.reject(user);
			return;
		}
		user.job.linkedJob.tasktypeid = data[0].userType;

		deferred.resolve(user);
	});

	return deferred.promise;
};



var getUserCookies = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		if (data.length < 1) {
			deferred.reject(user);
			return;
		}
		user.cookies = data[0].cookies;
		deferred.resolve(user);
	});

	return deferred.promise;
};

var fetchAuth = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		user.username = data[0].username;
		user.password = data[0].password;
		deferred.resolve(user);

	});

	return deferred.promise;
}

var saveTimeSheets = function (user) {
	var deferred = Q.defer();

	var ObjectID = mongo.ObjectID;
	var id = ObjectID.createFromHexString(user.id);

	users.find({'_id': id}).toArray(function(err, data) {
		user.stored = data[0];

		//ON MONDAYS RUN SCHEDULED CRON JOB

		user = functions.mergeTimesheets(user, user.rawTimeSheets);
		
		// Check if any timesheets hav unsaved time.
		// Return with time based on that day
		user = functions.checkUnsavedTimesheets(user);

		users.update({ _id: id }, {
			$set: {
				timeSheets: user.timeSheets
			}
		}, function (err, results) {
			deferred.resolve(user);
		}, 
		{ upsert: true });

	});

	return deferred.promise;

}

var checkUnsavedTimesheets = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		user.timeSheets = [];
		user.hasUnsaved = false;

		var sheets = data[0].timeSheets;

		var now = new Date();
		var today = new Date().getDate();

		for (var i = 0; i < sheets.length; i ++) {
			var day = new Date(sheets[i].addedOnDay).getDate();
			if ( sheets[i].appTime > 0 && day !== today) {
				user.timeSheets.push(sheets[i]);
				user.hasUnsaved = true;
			}
		}


		if (user.timeSheets.length > 0) {
			deferred.reject(user);
		} else {
			deferred.resolve(user);
		}
 
	});

	return deferred.promise;
}


var colour = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	users.find({'_id': id}).toArray(function(err, data) {

		for (var i = 0; i < data[0].timeSheets.length; i ++) {
			if (data[0].timeSheets[i].id.valueOf() == user.jobID) {
				data[0].timeSheets[i].colour = user.colour;
			}
		}

		users.update({ '_id': id }, {
			$set: {
				timeSheets: data[0].timeSheets
			}

		}, function (err, results) {
			deferred.resolve(user);
		}, 
		{ upsert: true });

	});

	return deferred.promise;
}

var updateSingleJob = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	users.find({'_id': id}).toArray(function(err, data) {

		for (var i = 0; i < data[0].timeSheets.length; i ++) {
			if (data[0].timeSheets[i].id.valueOf() == user.job.id) {
				data[0].timeSheets[i].appTime = parseInt(user.job.appTime) - parseInt(data[0].timeSheets[i].chaseTime);
			}
		}

		users.update({ '_id': id }, {
			$set: {
				timeSheets: data[0].timeSheets
			}

		}, function (err, results) {
			deferred.resolve(user);
		}, 
		{ upsert: true });

	});

	return deferred.promise;
}


//Get and setup all timesheets for Chase update
var getAllTimesheets = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	users.find({'_id': id}).toArray(function(err, data) {

		var sheets = [];

		for (var i = 0; i < data[0].timeSheets.length; i ++) {
			//if no change - skip
			if ( data[0].timeSheets[i].appTime === 0 ) continue;

			//Add appTime to the chase record
			data[0].timeSheets[i] = functions.addAppTime(data[0].timeSheets[i], data[0].currentDay);

			//Add to final save object
			sheets.push(functions.setupUpdateObject(data[0].timeSheets[i]));
		}

		//final object
		user.updateSheets = sheets;

		deferred.resolve(user);

	});


	return deferred.promise;
}


var toggleHide = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	users.find({'_id': id}).toArray(function(err, data) {

		for (var i = 0; i < data[0].timeSheets.length; i ++) {
			if (data[0].timeSheets[i].id.valueOf() == user.jobID) {
				data[0].timeSheets[i].isHidden = (user.isHidden === "true");
			}
		}

		users.update({ '_id': id }, {
			$set: {
				timeSheets: data[0].timeSheets
			}

		}, function (err, results) {
			deferred.resolve(user);
		}, 
		{ upsert: true });

	});

	return deferred.promise;
}


var updateCurrentDates = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	if (!user.hasUnsaved) {

		users.update({ '_id': id }, {
			$set: {
				currentDay: new Date().getDay(),
				currentDate: new Date().getDate()
			}

		}, function (err, results) {
			deferred.resolve(user);
		}, 
		{ upsert: true });


	} else {
		deferred.resolve(user);
	}

	return deferred.promise;
}


var createNewJob = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id);

	if (user.job.isAnonymous) {

	}

	var timeSheetId = new ObjectId();
	var chaseId = user.job.chaseId || "";

	users.update({ '_id': id }, {
		$push: {
			timeSheets: {
				id: 			timeSheetId,
				customTitle: 	user.job.customTitle,
				colour: 		user.job.colour,
				isAnonymous: 	user.job.isAnonymous,
				appTime: 		0,
				chaseId: 		chaseId,
				isHidden: 		false,
				isTiming: 		false,
				timingStamp: 	0,
				chaseTime:  	0,
				record: 		[]
			}
		}

	}, function (err, results) {
		deferred.resolve(user);
	}, 
	{ upsert: true });


	return deferred.promise;
}


module.exports = {
  createUser: 				createUser,
  updateUserCookies: 		updateUserCookies,
  getUserCookies: 			getUserCookies,
  insertDetails: 			insertDetails,
  fetchAuth: 				fetchAuth,
  saveTimeSheets: 			saveTimeSheets,
  checkUnsavedTimesheets: 	checkUnsavedTimesheets,
  colour: 					colour,
  updateSingleJob: 			updateSingleJob,
  getAllTimesheets: 		getAllTimesheets,
  toggleHide: 				toggleHide,
  updateCurrentDates: 		updateCurrentDates,
  createNewJob: 			createNewJob,
  checkUserType: 			checkUserType,
  setJobType: 				setJobType,
  getJobType: 				getJobType
}
