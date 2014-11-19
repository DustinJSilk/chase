var mongo = require('mongodb');


//Returns the chase record for the given day (timestamp)
//Defaults to today
var getDaysRecord = function (sheet, day) {
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

// 00:00 -> Minutes
var parseTime = function (time) {
	
	var hours = parseInt(time.split(":")[0] * 60);
	var minutes = parseInt(time.split(":")[1]);
	
	return hours + minutes;
}

// Minutes -> 00:00
var unparseTime = function (time) {
	var hours;

	if ( Math.floor(time / 60) === 0 ) {
		hours = "00"
	} else {
		if ( Math.floor(time / 60) < 10 ) {
			hours = "0" + Math.floor(time / 60)
		} else {
			hours = Math.floor(time / 60);
		}
	}

	var minutes = ( time % 60 < 10 ) ? "0" + (time % 60) : (time % 60);

	var str = hours + ":" + minutes;

	return str.trim();
}

// YYY/MM/DD
var formatDate = function (dateObject) {
	var date = dateObject.getFullYear() + "/" + (dateObject.getMonth() + 1) + "/" + dateObject.getDate();
	return date;
}


var createNewRecord = function (data, currentDay) {
	var ObjectID = mongo.ObjectID;
	var timeSheetId = new ObjectID();

	var timestamp = new Date().getTime();

	var timeSheet = {
		id: 				timeSheetId,
		chaseId: 			data[0],
		customTitle: 		"",
		colour: 			null,
		isHidden: 			false,
		isAnonymous: 		false,
		isTiming: 			false,
		timingStamp: 		0,
		chaseTime:  		parseTime(getDaysRecord(data, currentDay)), //Record from chase server. Used to check if chase data ever changes
		appTime:  			0, // extra time added through app
		record: 			data
	}
	return timeSheet;
}

var mergeSingleSheet = function (old, raw, currentDay) {
	var sheet = old;

	sheet.record = raw;

	// Get chaseTime and appTime. If the record on Chase today has changed - reset appTime.
	// If it has not changed, then total time is chaseTime + appTime
	// Make sure to compare the chase time of the day equal to the record timestamp

	//If it has changed - overwrite
	if ( sheet.chaseTime !== parseTime(getDaysRecord(raw, currentDay)) ) {
		sheet.appTime = 0;
		sheet.addedOnDay = new Date().getTime();
		sheet.chaseTime = parseTime(getDaysRecord(raw, currentDay));
	}

	return sheet;
}


var mergeTimesheets = function (user, raw) {
	var ObjectID = mongo.ObjectID;
	user.timeSheets = [];
	user.currentDay = user.stored.currentDay;
	user.currentDate = user.stored.currentDate;

	var old = user.stored.timeSheets;

	// Iterate through old and new and merge
	// New first, old inside
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
			user.timeSheets.push(mergeSingleSheet(old[index], raw[n], user.currentDay));
		} else {
			//Create new record
			user.timeSheets.push(createNewRecord(raw[n], user.currentDay))
		}
	}

	// Now add any anonymous timesheets
	for (var i = 0; i < old.length; i ++) {
		if (old[i].isAnonymous === true) {
			user.timeSheets.push(old[i]);
		}
	}

	// No need to add non-anonymous unsaved sheets - they get saved to Chase on creation

	return user;
}

var checkUnsavedTimesheets = function (user) {
	user.hasUnsaved = false;

	var sheets = user.timeSheets;
	var today = new Date().getDate();


	//iterate through timesheets and check if any time has changed
	if ( user.currentDate !== today ) {
		for (var i = 0; i < sheets.length; i ++) {
			if ( sheets[i].appTime > 0 ) {
				user.hasUnsaved = true;
			}
		}
	}

	//If there isnt any unsaved date. Make currentDay and currentDate todays date.
	if ( !user.hasUnsaved ) {
		user.currentDay = new Date().getDay();
		user.currentDate = new Date().getDate();
	}

	// Iterate through sheets and set ChaseTime to the day that is unsaved
	for (var i = 0; i < sheets.length; i ++) {
		if ( !sheets[i].isAnonymous ) {
			sheets[i].chaseTime = parseTime(getDaysRecord(sheets[i].record, user.currentDay));
		}
	}


	user.timeSheets = sheets;

	return user;
}


var addAppTime = function (sheet, day) {

	//Get day of week
	//var day = new Date(sheet.addedOnDay).getDay();

	//Add times together and format 00:00
	var updatedTime = unparseTime(parseInt(sheet.appTime) + parseInt(sheet.chaseTime));

	//Update record
	switch (day) {
		case 0:
			sheet.record[21] = updatedTime;
			break;
		case 1:
			sheet.record[15] = updatedTime;
			break;
		case 2:
			sheet.record[16] = updatedTime;
			break;
		case 3:
			sheet.record[17] = updatedTime;
			break;
		case 4:
			sheet.record[18] = updatedTime;
			break;
		case 5:
			sheet.record[19] = updatedTime;
			break;
		case 6:
			sheet.record[20] = updatedTime;
			break;
	}

	return sheet;
}

var sumAll = function (record) {
	var all = 0;

	for (var i = 15; i <= 21; i ++) {
		all += parseTime(record[i]);
	}

	return unparseTime(all);
}

var setupUpdateObject = function (sheet) {
	var array = sheet.record;

	var object = {
		timesheetitemid: 			array[0],
		configid: 				array[1],
		company: 					array[2],
		customerid: 				array[3],
		client: 					array[4],
		productid: 				array[5],
		product: 					array[6],
		jobid: 					array[7],
		jobclosed: 				array[8],
		job: 						array[9],
		taskid: 					array[10],
		cancomplete: 				!!+array[11],
		tasktypeid: 				array[12],
		notes: 					array[13],
		task: 					array[14],
		day1Time: 				array[15],
		day2Time: 				array[16],
		day3Time:  				array[17],
		day4Time: 				array[18],
		day5Time: 				array[19],
		day6Time: 				array[20],
		day7Time: 				array[21],
		sumall: 					sumAll(array),
		exportdate0: 				"",
		exportdate1: 				"",
		exportdate2: 				"",
		exportdate3: 				"",
		exportdate4: 				"",
		exportdate5: 				"",
		exportdate6: 				"",
		status0: 					"",
		status1: 					"",
		status2: 					"",
		status3: 					"",
		status4: 					"",
		status5: 					"",
		status6: 					"",
		timesheetmaterialitems: 	0,
		showEditButton: 		 	true,
		canaddnotes: 				true,
		showDeleteButton: 		true,
		itemorder: 				1
	}

	return object;
}


//When adding a new item to chase this is the object to send it
var createNewLineItem = function (user) {
	var newJob = {  
		timesheetitemid: 		null,
		jobid: 					6960,
		customerid: 			32,
		productid: 				727,
		taskid: 				null,
		tasktypeid: 			110,
		day1Time: 				0,
		day2Time: 				0,
		day3Time: 				0,
		day4Time: 				0,
		day5Time: 				0,
		day6Time: 				0,
		day7Time: 				0,
		notes: 					"test"
	}

}


var jsonToURI = function (json) { 
	return encodeURI(JSON.stringify(json)); 
}


module.exports = {
	getDaysRecord: 			getDaysRecord,
	mergeTimesheets: 		mergeTimesheets,
	createNewRecord: 		createNewRecord,
	mergeSingleSheet: 		mergeSingleSheet,
	setupUpdateObject: 		setupUpdateObject,
	addAppTime: 			addAppTime,
	jsonToURI: 				jsonToURI,
	checkUnsavedTimesheets: checkUnsavedTimesheets,
	formatDate: 			formatDate
}


