var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
var path = require('path');
var fs = require("fs");

if (!fs.existsSync(__dirname+'/public')){
    fs.mkdirSync(__dirname+'/public');
}

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});

function getDir(dir,level,downloading){
        response = "";
        let filenames = fs.readdirSync(dir);
        filenames.forEach((file) => {
                isAvailable = "";
                d = downloading;
                if(d){
                        isAvailable = "color: red; ";
                }
                if(fs.existsSync(dir+"/"+file+".aria2")){
                        isAvailable = "color: red; "
                        d = true;
                }
                if(!file.includes(".aria2")){
                        if(fs.lstatSync(dir+"/"+file).isDirectory()){
                                response+="<p style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p><br>";
                                response+=getDir(dir+"/"+file,level+1,d,parnt+"file");
                        } else {
                                response+="<a style=\"" + isAvailable + "white-space: nowrap; margin-left: " + (30*level).toString() + "px\" href=\""+dir.replace("/root/reece illegal/","")+"/"+file+"\">📄"+file+"</a><br>";
                        }
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
	var response = "<h1>Downloads</h2><p>If you just got sent here from pressing \"submit\", do not worry if your files are not here yet, it can take some time to start the download</p><p>If your file is red, it is still downloading! You can refresh the page later</p><hr>"+getDir(path.join(__dirname+'/public'), 0, false);
	res.send(response);
});

app.use('/public', express.static(__dirname + '/public'));

var server = app.listen(80);
