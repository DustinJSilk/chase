

exports.login = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, id: user.id });
}


exports.timeSheets = function (user) {
	user.res.header('Access-Control-Allow-Origin', '*');
    user.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    user.res.header('Access-Control-Allow-Headers', 'Content-Type');
    user.res.json({ success: true, timeSheets: {unsaved: user.hasUnsaved, sheets: user.timeSheets} });
}

