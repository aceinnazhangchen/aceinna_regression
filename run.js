const rtk_process = require("./run_rtk_process.js");
const ins_process = require("./run_ins_process.js");
const analysis = require("./run_analysis.js");
const map_ini = require("./load/map_ini.js");
const ver_json = require("./load/ver_json.js");

async function run(){
    if(ver_json.load_version_json() == false) return;
    if(map_ini.load_ref_ini() == false) return;
    let git_ver = ver_json.get_version();
    console.log(git_ver);
    await rtk_process.run(git_ver);
    await ins_process.run(git_ver);
    await analysis.run(git_ver);
}

run();