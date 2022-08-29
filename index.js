var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
var path = require('path');
var fs = require("fs");

const downloadDir = __dirname+'/public';

if (!fs.existsSync(downloadDir)){
    fs.mkdirSync(downloadDir);
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
                                        response+="<p style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p> <a style=\"color: blue; text-decoration: underline;\" onclick=\"collapse('"+sanitiseNames(file)+"');\">↩️</a><br>";
                                }else{
                                        p = parentdir;
                                        response+="<p class=\"" + p + "\" style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p><br>";
                                }
                                response+=getDir(dir+"/"+file,level+1,d,p);
                        } else {
                                response+="<a class=\"" + p + "\"style=\"" + isAvailable + "white-space: nowrap; margin-left: " + (30*level).toString() + "px\" href=\""+dir.replace(downloadDir+"/","public")+"/"+file+"\">📄"+file+"</a><br>";
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
	const { execFile } = require("child_process");
        console.log("Downloading from magnet: ", req.body.magnet)
	execFile("aria2c", ["--seed-time=0", req.body.magnet, "-d", "public"], (error, stdout, stderr) => {
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
	var Download_prompt = "<h1>Downloads</h2><p>If you just got sent here from pressing \"submit\", do not worry if your files are not here yet, it can take some time to start the download</p><p>If your file is red, it is still downloading! You can refresh the page later</p><hr>";
	var Collapse_script = '<script>let folders = new Map();function collapse(key) {if (!(folders.has(key))){folders.set(key, true)}if (folders.get(key)) {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "hidden";item.style.lineHeight = "0";});} else {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "visible";item.style.lineHeight = "1";});}folders.set(key, !folders.get(key));};</script>';
        var Files = getDir(path.join(downloadDir), 0, false, "")
        res.send(Download_prompt+Collapse_script+Files);
});

app.use('/public', express.static(downloadDir));

var server = app.listen(80);
console.log("Live at http://127.0.0.1:80");
