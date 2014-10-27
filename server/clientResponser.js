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
			jobSubtitle: 		"",
			colour: 			user.timeSheets[i].colour,
			isHidden: 			user.timeSheets[i].isHidden,
			isAnonymous: 		user.timeSheets[i].isAnonymous,
			isTiming: 			user.timeSheets[i].isTiming,
			timingStamp: 		user.timeSheets[i].timingStamp,
			todaysTime:  		user.timeSheets[i].chaseTime + user.timeSheets[i].appTime,
			todaysDay: 			user.timeSheets[i].todaysDay,
			record: 			functions.getDaysRecord(user.timeSheets[i])
		}

		if (user.timeSheets[i].record[9].length < 1 && user.timeSheets[i].record[6].length < 1) {
			sheets[i].customTitle = user.timeSheets[i].record[14];

		} else if (user.timeSheets[i].customTitle.length < 1) {
			sheets[i].customTitle = user.timeSheets[i].record[9];
			sheets[i].subtitle = user.timeSheets[i].record[9].split(" - ")[0] + " - " + user.timeSheets[i].record[6] + " - " + user.timeSheets[i].record[9].split(" - ")[1];
		}
	}

	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, timeSheets: {unsaved: user.hasUnsaved, sheets: sheets} });
}

exports.success = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, colour: user.colour });
}

