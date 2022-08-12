var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
var path = require('path');
var fs = require("fs");
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});

function getDir(dir,level){
	response = "";
	let filenames = fs.readdirSync(dir);
	filenames.forEach((file) => {
		if(fs.lstatSync(dir+"/"+file).isDirectory()){
        		response+="<p style=\"white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p><br>";
			response+=getDir(dir+"/"+file,level+1);
		} else {
			response+="<a style=\"white-space: nowrap; margin-left: " + (30*level).toString() + "px\" href=\""+dir.replace("/root/reece illegal/","")+"/"+file+"\">📄"+file+"</a><br>";
		}
	});
	return response;
}

app.post('/submit', function(req,res){
	if(!req.body.magnet){
		res.end("No Fields");
		return;
	}
	res.redirect('/list');
	const { exec } = require("child_process");
	exec("aria2c --seed-time=0 \'" + req.body.magnet + "\' -d \'public/\'", (error, stdout, stderr) => {
		if (error) {
			console.log(error.message);
			return;
		}
		if (stderr) {
        		console.log(stderr);
        		return;
		}
		console.log(`stdout: ${stdout}`);
	});
});

app.get('/list', function(req,res){
	var response = "<h1>Downloads</h2><p>If you just got sent here from pressing \"submit\", do not worry if your file/.aria2 isn't here immediately, it takes some time to start the download (this grows inversely with the amount of seeders and proportionally with size of the torrent and how many files it has), if it has been >10 minutes, your download probably failed</p><p>If you see your desired file but there is another one that ends in .aria2, leave it, it is still downloading! You can refresh the page later</p><hr>"+getDir(path.join(__dirname+'/public'), 0);
	res.send(response);
});

app.use('/public', express.static(__dirname + '/public'));

var server = app.listen(80);
