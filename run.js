const rtk_process = require("./run_rtk_process.js");
const ins_process = require("./run_ins_process.js");
const analysis = require("./run_analysis.js");


async function run(){
    var args = process.argv.splice(2)
	console.log(args);
    let git_ver = args[0];
    if(git_ver.length == 40){
        git_ver = git_ver.substr(0,7);
    }
    await rtk_process.run(git_ver);
    await ins_process.run(git_ver);
    await analysis.run(git_ver);
}

run();