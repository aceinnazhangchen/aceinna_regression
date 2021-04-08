const ver_json = require("../load/ver_json.js");

function record_git_ver(){
    ver_json.load_version_json();
    var args = process.argv.splice(2);
    //console.log(args);
    if(args.length >= 2){
        let project = args[0];
        let git_ver = args[1];
        ver_json.write_version_json(project,git_ver);
    }   
}

record_git_ver();