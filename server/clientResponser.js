var functions = require('./functions.js');

exports.login = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, id: user.id });
}

exports.relogin = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.status(401)
    user.res.json({ success: false, code: 401, message: "Login failed"  });
}


exports.timeSheets = function (user) {

	var sheets = [];

	for (var i = 0; i < user.timeSheets.length; i ++) {
		sheets[i] = {
			_id: 				user.timeSheets[i].id,
			customTitle: 		user.timeSheets[i].customTitle,
			subtitle: 			"",
			colour: 			user.timeSheets[i].colour,
			isHidden: 			user.timeSheets[i].isHidden,
			isAnonymous: 		user.timeSheets[i].isAnonymous,
			isTiming: 			user.timeSheets[i].isTiming,
			timingStamp: 		user.timeSheets[i].timingStamp,
			todaysTime:  		parseInt(user.timeSheets[i].chaseTime) + parseInt(user.timeSheets[i].appTime)
		}

		if (user.timeSheets[i].isAnonymous) {
			continue;
		}
		
		if (user.timeSheets[i].record[9].length < 1 && user.timeSheets[i].record[6].length < 1) {
			sheets[i].customTitle = user.timeSheets[i].record[14];

		} else if (user.timeSheets[i].customTitle.length < 1) {
			sheets[i].customTitle = user.timeSheets[i].record[9];
			sheets[i].subtitle = user.timeSheets[i].record[9].split(" - ")[0] + " - " + user.timeSheets[i].record[6] + " - " + user.timeSheets[i].record[9].split(" - ")[1];
		}

	}

	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, timeSheets: {unsaved: user.hasUnsaved, sheets: sheets, day: user.day} });
}

exports.success = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true});
}

exports.searchJob = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.status(200)
    user.res.json({ success: true, code: 200, results: user.results });
}

exports.grabJob = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.status(200)
    user.res.json({ success: true, code: 200, results: user.results });
}

exports.updatedJob = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.status(200)
    user.res.json({ success: true, code: 200 });
}

exports.couldntUpdate = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.status(503)
    user.res.json({ success: false, code: 503, message: "Couldn't update todays time."  });
}

exports.updatedAll = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true });
}

