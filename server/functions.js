var mongo = require('mongodb');

var getDaysRecord = function (sheet) {
	var day = new Date().getDay();
	var record;
	switch (day) {
		case 0:
			record = sheet[21]
			break;
		case 1:
			record = sheet[15]
			break;
		case 2:
			record = sheet[16]
			break;
		case 3:
			record = sheet[17]
			break;
		case 4:
			record = sheet[18]
			break;
		case 5:
			record = sheet[19]
			break;
		case 6:
			record = sheet[20]
			break;
	}
	return record;
}

var parseTime = function (time) {
	
	var hours = parseInt(time.split(":")[0] * 60);
	var minutes = parseInt(time.split(":")[1]);
	
	return hours + minutes;
}


var createNewRecord = function (data) {
	var ObjectID = mongo.ObjectID;
	var timeSheetId = new ObjectID();

	var now = new Date();
	var fullDaysSinceEpoch = Math.floor(now/8.64e7);

	var timeSheet = {
		id: 				timeSheetId,
		chaseId: 			data[0],
		customTitle: 		"",
		colour: 			null,
		isHidden: 			false,
		isAnonymous: 		false,
		isTiming: 			false,
		timingStamp: 		0,
		todaysTime:  		0,
		todaysDay: 			fullDaysSinceEpoch,
		record: 			data
	}
	return timeSheet;
}

var mergeSingleSheet = function (old, raw) {
	var sheet = old;

	sheet.record = raw;

	if (getDaysRecord(old.record) !== getDaysRecord(raw)) {
		sheet.todaysTime = parseTime(getDaysRecord(raw));
	}

	return sheet;
}


var mergeTimesheets = function (old, raw) {
	var ObjectID = mongo.ObjectID;
	var newSheets = [];

	//iterate through old and new and merge
	for (var n = 0; n < raw.length; n ++) {
		var chaseId = raw[n][0];
		var index = -1;

		//find matching record
		for (var l = 0; l < old.length; l ++) {
			if (chaseId === old[l].chaseId) {
				index = l;
				break;
			}
		}

		if (index !== -1) {
			//CHASE ALWAYS WINS - Merge
			newSheets.push(mergeSingleSheet(old[index], raw[n]));
		} else {
			//Create new record
			newSheets.push(createNewRecord(raw[n]))
		}
	}

	return newSheets;
}


module.exports = {
	getDaysRecord: getDaysRecord,
	mergeTimesheets: mergeTimesheets,
	createNewRecord: createNewRecord,
	mergeSingleSheet: mergeSingleSheet,
	mondayMerge: mondayMerge
}


