var mongo = require('mongodb');
var Q = require('q');
var clientResponser = require('./clientResponser.js');

var users;
mongo.connect("mongodb://localhost/chase", function (err, db) {
	users = db.collection('users');	
});

var insertDetails = function (user, callback) {
	var cookie = "";
	for (var i = 0; i < user.cookies.length; i ++) {
		cookie += user.cookies[i] + "; ";
	}
	user.cookieJar = cookie;

	if (user.id !== undefined && user.id !== null) {
		updateUserCookies(user, callback);

	} else {
		users.find({'username': user.req.body.em}).toArray(function (err, data) {
			if (data.length > 0) {
				user.id = data[0]._id.toHexString();
				updateUserCookies(user, callback);
			} else {
				createUser(user, callback);
			}
		});
	};
	
};


var updateUserCookies = function (user, callback) {
	var ObjectID = mongo.ObjectID;
	var userId = ObjectID.createFromHexString(user.id);
	
	users.update({ _id: userId }, {
		$set: {cookies: user.cookieJar}

	}, function (err, results) {
		callback(user);
	});

};


var createUser = function (user, callback) {
	users.insert({
		username: user.req.body.em,
		password: user.req.body.pw,
		cookies: user.cookieJar,
		timeSheets: []
	
	}, function (err, results){
		user.id = results[0]._id;
		callback(user);
	});
};


var getUserCookies = function (user) {

	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		user.cookies = data[0].cookies;
		deferred.resolve(user);
	});

	return deferred.promise;
};

var fetchAuth = function (user, callback) {
	
	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		user.username = data[0].username;
		user.password = data[0].password;
		callback(user);

	});

}

var saveTimeSheets = function (user) {
	var deferred = Q.defer();

	var ObjectID = mongo.ObjectID;
	var id = ObjectID.createFromHexString(user.id);

	var timeSheets = [];

	var now = new Date();
	var fullDaysSinceEpoch = Math.floor(now/8.64e7);

	for (var i = 0; i < user.rawTimeSheets.length; i ++) {
		var timeSheetId = new ObjectID();

		var timeSheet = {
			id: 				timeSheetId,
			chaseId: 			user.rawTimeSheets[i][0],
			customTitle: 		"",
			isFavourite: 		false,
			isHidden: 			false,
			isAnonymous: 		false,
			isTiming: 			false,
			timingStamp: 		0,
			unaddedTime:  		0,
			unaddedTimeDate: 	fullDaysSinceEpoch,
			record: 			user.rawTimeSheets[i]
		}
		timeSheets.push(timeSheet);
	}
	

	users.update({ _id: id }, {
		$set: {
			timeSheets: timeSheets
		}

	}, function (err, results) {
		deferred.resolve(user);
	}, 
	{ upsert: true });

	return deferred.promise;

}

var checkUnsavedTimesheets = function (user) {
	var deferred = Q.defer();

	var ObjectId = mongo.ObjectID;
	var id = ObjectId.createFromHexString(user.id)

	users.find({'_id': id}).toArray(function(err, data) {
		user.unsaved = [];
		user.hasUnsaved = false;
		
		var sheets = data[0].timeSheets;

		var now = new Date();
		var fullDaysSinceEpoch = Math.floor(now/8.64e7);

		for (var i = 0; i < sheets.length; i ++) {
			if ( (sheets[i].unaddedTime > 0 && unaddedTimeDate < fullDaysSinceEpoch) ||
				 (sheets[i].isAnonymous === true && sheets[i].unaddedTime > 0) ) {
				user.unsaved.push(sheets[i]);
				user.hasUnsaved = true;
			}
		}

		if (unsaved.length > 0) {
			deferred.reject(user);
		} else {
			deferred.resolve(user);
		}
 
	});

	return deferred.promise;
}


module.exports = {
  createUser: createUser,
  updateUserCookies: updateUserCookies,
  getUserCookies: getUserCookies,
  insertDetails: insertDetails,
  fetchAuth: fetchAuth,
  saveTimeSheets: saveTimeSheets,
  checkUnsavedTimesheets: checkUnsavedTimesheets
}
