var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));




/*
	LOGIN

	$.ajax({
	  type: "POST",
	  url: "http://localhost:7501/login",
	  data: {em: "username", pw: "password"},
	  success: function (res) {console.log(res)}
	})
*/

app.use('/login', function(req, res) {
	request.post(
	    'http://192.168.1.53/ChaseMachine/Login.aspx',
	    { form: { req: 'auth',  cid: '1', em: req.body.em, pw: req.body.pw, rm: true} },
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	        	var cookie = response.headers['set-cookie'];
	            console.log(cookie)
	            console.log(body)

	            res.header('Access-Control-Allow-Origin', '*');
			    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			    res.header('Access-Control-Allow-Headers', 'Content-Type');
	            res.json({ success: true });
	        }
	    }
	);

});


/*
	Start server
*/
console.log("listening")
app.listen(7501);