

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

	function getDaysRecord () {
		var day = new Date().getDay();
		var record;
		switch (day) {
			case 0:
				record = user.timeSheets[i].record[21]
				break;
			case 1:
				record = user.timeSheets[i].record[15]
				break;
			case 2:
				record = user.timeSheets[i].record[16]
				break;
			case 3:
				record = user.timeSheets[i].record[17]
				break;
			case 4:
				record = user.timeSheets[i].record[18]
				break;
			case 5:
				record = user.timeSheets[i].record[19]
				break;
			case 6:
				record = user.timeSheets[i].record[21]
				break;
		}
		return record;
	}

	var sheets = [];

	for (var i = 0; i < user.timeSheets.length; i ++) {
		sheets[i] = {
			id: 				user.timeSheets[i].id,
			customTitle: 		user.timeSheets[i].customTitle,
			jobSubtitle: 		"",
			colour: 			user.timeSheets[i].colour,
			isHidden: 			user.timeSheets[i].isHidden,
			isAnonymous: 		user.timeSheets[i].isAnonymous,
			isTiming: 			user.timeSheets[i].isTiming,
			timingStamp: 		user.timeSheets[i].timingStamp,
			unaddedTime:  		user.timeSheets[i].unaddedTime,
			unaddedTimeDate: 	user.timeSheets[i].unaddedTimeDate,
			record: 			getDaysRecord()
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

