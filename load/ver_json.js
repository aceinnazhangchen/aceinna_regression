const fs = require('fs');
const path = require("path");
const setting = require('../config/process_setting.json');

var ver_data = {};

function load_version_json(){
    var ret = false;
    var version_file_path = path.join(setting.workspace_root,setting.bin_file_folder,"git-version.json");
    if(fs.existsSync(version_file_path)){
        var content = fs.readFileSync(version_file_path,'utf-8');
        ver_data = JSON.parse(content);
        ret = true;
    }
    return ret;
}

function write_version_json(project,version){
    if(project == 'rtk'){
        ver_data.rtk = version.substr(0,7);
    }else if(project == 'ins'){
        ver_data.ins = version.substr(0,7);
    }
    //console.log(ver_data);
    var version_file_path = path.join(setting.workspace_root,setting.bin_file_folder,"git-version.json");
    fs.writeFileSync(version_file_path,JSON.stringify(ver_data,null,4));
}

function get_version(){
    return "rtk_"+ ver_data.rtk + "-ins_" + ver_data.ins;
}

module.exports = {
    load_version_json,
    write_version_json,
    get_version
}