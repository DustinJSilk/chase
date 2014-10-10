var mongo = require('mongodb');
var clientResponser = require('./clientResponser.js');



exports.createUser = function (user, callback) {
	var cookie = "Cookie: ";
	for (var i = 0; i < user.cookies.length; i ++) {
		cookie += user.cookies[i] + "; ";
	}

	mongo.connect("mongodb://localhost/chase", function (err, db) {
		var users = db.collection('users');	

		users.insert({
			username: user.req.body.em,
			password: user.req.body.pw,
			cookies: cookie
		
		}, function(err, results){
			user.id = results[0]._id;
			callback(user);
			db.close();
		});

	});
};


exports.updateUserCookies = function (id, cookies) {

};


exports.updateUserLoginDetails = function (id, username, password) {

};


exports.getUserCookies = function (user, callback) {
	mongo.connect("mongodb://localhost/chase", function (err, db) {
		var users = db.collection('users');
	
		var ObjectId = mongo.ObjectID;
		var id = ObjectId.createFromHexString(user.req.body.id)

		users.find({'_id': id}).toArray(function(err, data) {
			user.cookie = data[0].cookie;

			callback(user);

			db.close();
		});

	}); 
}
