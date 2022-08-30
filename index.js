var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
var path = require('path');
var fs = require("fs");

const downloadDir = __dirname+'/public';

if (!fs.existsSync(downloadDir)){
	fs.mkdirSync(downloadDir);
	fs.mkdirSync(downloadDir+"/private");
}

if (!fs.existsSync(downloadDir+"/private")){
	fs.mkdirSync(downloadDir+"/private");
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
		if(dir == downloadDir){ // on root level
			if(file == "private"){
				return;
			}
		}
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
                                        response+="<p style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p> <a class=\"" + p + "a\"style=\"color: blue; text-decoration: underline;\" onclick=\"collapse('"+sanitiseNames(file)+"');\">⤴️</a><br>";
                                }else{
                                        p = parentdir;
                                        response+="<p class=\"" + p + "\" style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p><br>";
                                }
                                response+=getDir(dir+"/"+file,level+1,d,p);
                        } else {
                                response+="<a class=\"" + p + "\"style=\"" + isAvailable + "white-space: nowrap; margin-left: " + (30*level).toString() + "px\" href=\""+dir.replace(downloadDir,"public")+"/"+file+"\">📄"+file+"</a><br>";
                        }
                }
        });
        return response;
}

app.post('/submit', function(req,res){
	if(!req.body.magnet){
		res.end("No Magnet Field");
		return;
	}
	var x = "";
	if(req.body.password){
		x="/private/"+req.body.password;
		if(!fs.existsSync(downloadDir+x)){
			fs.mkdirSync(downloadDir+x);
		}
		res.redirect('/list?pass='+req.body.password);
	}else{res.redirect('/list');}
	const { execFile } = require("child_process");
        console.log("Downloading from magnet: ", req.body.magnet)
	execFile("aria2c", ["--seed-time=0", req.body.magnet, "-d", downloadDir+x], (error, stdout, stderr) => {
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
	var currDir = downloadDir;
	if(req.query.pass){
		console.log("User with password: " + req.query.pass + " accessed personal files");
		currDir+='/private/'+req.query.pass;
		if(!fs.existsSync(currDir)){
			res.send("Password doesn't have a matching directory: Download a file using your password to create one");
			return;
		}
	}
	var Download_prompt = "<h1>Downloads</h2><p>If you just got sent here from pressing \"submit\", do not worry if your files are not here yet, it can take some time to start the download</p><p>If your file is red, it is still downloading! You can refresh the page later</p><hr>";
	var Collapse_script = '<script>let folders = new Map();function collapse(key) {if (!(folders.has(key))){folders.set(key, true)}if (folders.get(key)) {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "hidden";item.style.lineHeight = "0";});} else {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "visible";item.style.lineHeight = "1";});}folders.set(key, !folders.get(key));};</script>';
        var Files = getDir(path.join(currDir), 0, false, "")
        res.send(Download_prompt+Collapse_script+Files);
});

app.use('/public', express.static(downloadDir));

var server = app.listen(80);
console.log("Live at http://127.0.0.1:80");
