const rtk_process = require("./run_rtk_process.js");
const ins_process = require("./run_ins_process.js");
const analysis = require("./run_analysis.js");
const load_ini = require("./load_ini.js");


async function run(){
    var args = process.argv.splice(2)
	console.log(args);
    let git_ver = "git-version";
    if(args.length > 0){
        git_ver = args[0];
        if(git_ver.length == 40){
            git_ver = git_ver.substr(0,7);
        }
    }
    load_ini.load_ref_ini();
    //await rtk_process.run(git_ver);
    //await ins_process.run(git_ver);
    await analysis.run(git_ver);
}

run();