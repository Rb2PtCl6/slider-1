const fs = require('fs');
const path = require('path');

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    } 
    return files_;
}

var raw = getFiles("images")

for (var i = 0; i < raw.length; i ++){
    raw[i] = ((path.normalize(raw[i])).replace(__dirname,"")).replace("\\","/")
}

console.log(raw)

fs.writeFileSync("images.json",JSON.stringify(raw))