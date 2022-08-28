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

function sanitiseNames(str){
        return str.replace(/[\W_]+/g, ' ').replace(new RegExp(' ', 'g'),'');
}

function getDir(dir,level,downloading,parentdir){
        response = "";
        let filenames = fs.readdirSync(dir);
        filenames.forEach((file) => {
                var p = parentdir;
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
                                if(parentdir==""){
                                        p = sanitiseNames(file);
                                        response+="<p style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p> <a style=\"color: blue; text-decoration: underline;\" onclick=\"" + sanitiseNames(file) + "FUNC1345();\">Collapse</a><br><script>var " + sanitiseNames(file) + "Toggle=true; function " + sanitiseNames(file) + "FUNC1345(){if(" + sanitiseNames(file) + "Toggle){Array.from(document.getElementsByClassName(\"" + sanitiseNames(file) + "\")).forEach((item, index) => {item.style.visibility = \"hidden\"; item.style.lineHeight=\"0\";});}else{Array.from(document.getElementsByClassName(\"" + sanitiseNames(file) + "\")).forEach((item, index) => {item.style.visibility = \"visible\"; item.style.lineHeight=\"1\";});}" + sanitiseNames(file) + "Toggle = !" + sanitiseNames(file) + "Toggle;}</script>";
                                }else{
                                        p = parentdir;
                                        response+="<p class=\"" + p + "\" style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">>📁"+file+"</p><br>";
                                }
                                response+=getDir(dir+"/"+file,level+1,d,p);
                        } else {
                                response+="<a class=\"" + p + "\"style=\"" + isAvailable + "white-space: nowrap; margin-left: " + (30*level).toString() + "px\" href=\""+dir.replace("/root/reece illegal/","")+"/"+file+"\">📄"+file+"</a><br>";
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
	exec("aria2c --seed-ratio=1.0 \'" + req.body.magnet + "\' -d \'public/\'", (error, stdout, stderr) => {
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
	var response = "<h1>Downloads</h2><p>If you just got sent here from pressing \"submit\", do not worry if your files are not here yet, it can take some time to start the download</p><p>If your file is red, it is still downloading! You can refresh the page later</p><hr>"+getDir(path.join(__dirname+'/public'), 0, false, "");
	res.send(response);
});

app.use('/public', express.static(__dirname + '/public'));

var server = app.listen(80);
