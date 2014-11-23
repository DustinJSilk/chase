var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/debug', function(req, res) {
	
	console.log(" ")
	console.log(req.body)

	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.json({ code: 200});
});


/*
	Start server
*/
console.log("listening on 7502")
app.listen(7502);
