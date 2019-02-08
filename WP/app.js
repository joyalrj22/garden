var express = require("express");

var session = require('express-session');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var jwt = require('jsonwebtoken');
const secret = "BD85DC2D124F8F73DC8B589926D66";
var api = express();
var bodyParser = require('body-parser');

var qs = require('querystring');

api.use(bodyParser.urlencoded({extended: false}));

api.use(express.static('public'));

function checkLoggedIn(token) {
	if (token !== "undefined" || (token.access_token == "concertina")) {
		
		return true;
	}
	
	return false;
}

api.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

api.get('/people', function (req, res) {
	var userData = fs.readFileSync('JSON/user.json').toString();
    userDetails = JSON.parse(userData);
	res.status(200).send(userDetails);
});

api.get('/people/:username', function(req, res){
	var userData = fs.readFileSync('JSON/user.json').toString();
    userDetails = JSON.parse(userData);
	for (i in userDetails){
		if (req.params.username == userDetails[i].username){
			res.status(200).send(userDetails[i]);
		}
	}
});

api.post('/people', function(req, res){
	let access = req.body.access_token;
	if (access != undefined && (access == "concertina" || jwt.decode(access).username != undefined)){
		var userData = fs.readFileSync('JSON/user.json').toString();
		userDetails = JSON.parse(userData);
		for ( i in userDetails){
			if (userDetails[i].username.toUpperCase() == req.body.username.toUpperCase()){
				res.status(400).send("Username already taken");
			}
		}
		userDetails.push({
			"username": req.body.username,
			"forename": req.body.forename,
			"surname": req.body.surname,
			"adminStatus": "none",
			"dp":"/User/Profile_Pictures/marcopolo.png"
			
		});
		fs.writeFileSync('JSON/user.json',JSON.stringify(userDetails));
		res.status(201).send("users updated");
	} else {
		res.status(403).send("Error");
	}
});
		

api.post('/login', function (req, res) {
	
	var pwData = fs.readFileSync('JSON/passwords.json').toString();
	userCreds = JSON.parse(pwData);
		
		
	var userData = fs.readFileSync('JSON/user.json').toString();
    userDetails = JSON.parse(userData);
	
	recvdCreds = qs.parse(req.body.formData);
	
	if (recvdCreds["user"] in userCreds){
		
		if (userCreds[recvdCreds["user"]]==recvdCreds["pw"]){

			for (usr in userDetails){
				if (userDetails[usr].username == recvdCreds["user"]){
					let payload = userDetails[usr];
					res.status(200).send(jwt.sign(payload, secret));
					break;
				}
			}
			
		} else{
			loggedin = false;
			return res.status(401).json({ message: 'Invalid Authentication Credentials' });
		}
		
	} else{
		loggedin = false;
		return res.status(401).json({ message: 'Invalid Authentication Credentials' });
	}
	
});

api.post('/addComment',function (req, res) {
	
	if (!checkLoggedIn(req.body.access_token)) {
		res.status(403).send("Not Authenticated");
		return;
	}
	var info = jwt.decode(req.body.access_token)
	var json;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();
	
	if (dd < 10) {
	  dd = '0' + dd;
	} 
	if (mm < 10) {
	  mm = '0' + mm;
	} 
	var today = dd + '/' + mm + '/' + yyyy;
	
	var data = fs.readFileSync('JSON/comments.json').toString();
	var obj = JSON.parse(data);
	var alreadyCommented = false;
	var dateExists = false;
	for (date in obj){
		if (today == date){
			dateExists = true;
			for (n in obj[date]){
				if (n == info.username){
					alreadyCommented = true;
					obj[date][n].push(req.body[Object.keys(req.body)[0]]);
					break;
				}
			}
			if (!alreadyCommented){
				obj[date][info.username] = [];
				obj[date][info.username].push(req.body[Object.keys(req.body)[0]]);
			}
			break;
		}
	}
	if (!dateExists){
			obj[today]={[Object.keys(req.body)[0]]:[req.body[Object.keys(req.body)[0]]]};
	}
    json = JSON.stringify(obj); //convert it back to json
    fs.writeFileSync('JSON/comments.json',json);

	});



api.get('/comments', function (req, res) {
	cData = fs.readFileSync('JSON/comments.json').toString();
	uData = fs.readFileSync('JSON/user.json').toString();
    res.send([JSON.parse(cData),JSON.parse(uData)]);

});

api.post('/addDiary',function (req, res) {
	if (!checkLoggedIn(req.body.access_token)) {
		res.status(403).send("Not Authenticated");
		return;
	}
	var json;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();
	
	if (dd < 10) {
	  dd = '0' + dd;
	} 
	if (mm < 10) {
	  mm = '0' + mm;
	} 
	var today = dd + '/' + mm + '/' + yyyy;
	var data = fs.readFileSync('JSON/diary.json').toString();
	var obj = JSON.parse(data);
	details = qs.parse(req.body.formData);
	obj[today] = {[details.title]:[details.desc]};
	json = JSON.stringify(obj);
	fs.writeFileSync('JSON/diary.json',json);
	res.send("success");
});


api.get('/diary', function (req, res) {
	fs.readFile('JSON/diary.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else{
    } else {
    res.send(JSON.parse(data));
}})
});

api.get('/photos', function (req,res) {
	photos = {"paths":["Images/1.jpg","Images/2.jpg","Images/3.jpg","Images/4.jpg",
	"Images/5.jpg","Images/6.jpg","Images/7.jpg","Images/8.jpg",
	"Images/10.jpg"]};
	res.send(photos);
});
api.get('/events',function (req,res) {
	fs.readFile('JSON/events.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    res.send(JSON.parse(data));
}})
});

api.post('/addEvent', function(req, res) {
	if (!checkLoggedIn(req.body.access_token)) {
		res.status(403).send("Not Authenticated");
		return;
	}
	var json;
	var data = fs.readFileSync('JSON/events.json').toString();
	var obj = JSON.parse(data);
	details = qs.parse(req.body.formData);
	obj[details.date] = {[details.title]:[details.desc]};
	json = JSON.stringify(obj);
	fs.writeFileSync('JSON/events.json',json);
	res.send("success");
});

module.exports = api;