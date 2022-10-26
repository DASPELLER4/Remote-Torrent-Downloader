var express = require('express');
var fileUpload = require("express-fileupload");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser());
app.use(
	  fileUpload()
);
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
                                        response+="<p style=\"" + isAvailable + "white-space: nowrap; display:inline; margin-left: " + (30*level).toString() + "px\">📁"+file+"</p> <a class=\"" + p + "a\"style=\"color: blue; text-decoration: underline;padding-left:0%\" onclick=\"collapse('"+sanitiseNames(file)+"');\">⤴️</a><br>";
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
app.post('/submitlocal', function(req,res){
	if(!req.files){
		res.end("No Files Sent");
		return;
	}
	var x = ""
	if(req.body.password){
		x="/private/"+req.body.password;
		if(!fs.existsSync(downloadDir+x)){
			fs.mkdirSync(downloadDir+x);
		}
		res.redirect('/list?pass='+req.body.password);
	}else{res.redirect('/list');}
	if(req.body.folderName){
		fs.mkdirSync(downloadDir+x+"/"+req.body.folderName);
		x+="/"+req.body.folderName;
	}
	if(!req.files.files.length){
		var path = downloadDir + x + "/" + req.files.files.name;
		req.files.files.mv(path, (err)=>{console.log(err)});
	}
	for(let i = 0; i < req.files.files.length; i++){
		var path = downloadDir + x + "/" + req.files.files[i].name;
		req.files.files[i].mv(path, (err))=>{};
	}
});
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
	execFile("aria2c", ["--seed-time=0", "-j1", req.body.magnet, "-d", downloadDir+x], (error, stdout, stderr) => {
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
	var style = "<style>html{background: url(data:image/png;base64,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);background-color: #000000;}p{color: white;font: 1rem 'MutatorSans', sans-serif; font-weight: inherit;}a{color: #00FF87; font: 1rem 'MutatorSans', sans-serif; font-weight: inherit;}a:visited{color: #00C3FF; font: 1rem 'MutatorSans', sans-serif; font-weight: inherit;}</style>"
	var Download_prompt = "<html><h1 style=\"padding-left: 5%; padding-top: 5%; font: 3rem 'MutatorSans', sans-serif; font-weight: inherit; color: white\">Downloads</h1><p style=\"padding-left: 5%;\">If you just got sent here from pressing \"submit\", do not worry if your files are not here yet, it can take some time to start the download</p><p style=\"padding-left: 5%;\">If your file is red, it is still downloading! You can refresh the page later</p>";
	var Collapse_script = '<script>let folders = new Map();function collapse(key) {if (!(folders.has(key))){folders.set(key, true)}if (folders.get(key)) {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "hidden";item.style.lineHeight = "0";});} else {Array.from(document.getElementsByClassName(key)).forEach((item, index) => {item.style.visibility = "visible";item.style.lineHeight = "1";});}folders.set(key, !folders.get(key));};</script><div style=\"padding-left:5%; background-color: #191919; padding-top:2%; padding-bottom:2%; padding-right:2%; border-radius: 10px;\">';
        var Files = getDir(path.join(currDir), 0, false, "")
        res.send(style+Download_prompt+Collapse_script+Files+"</div></html>");
});

app.use('/public', express.static(downloadDir));

var server = app.listen(80);
console.log("Live at http://127.0.0.1:80");
