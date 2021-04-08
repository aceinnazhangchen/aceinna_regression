const fs = require('fs');
const path = require("path");
const setting = require('./config/process_setting.json');

var RawList = [];
var RefList = [];

function load_ref_ini(){
    var ini_file_path = path.join(setting.workspace_root,setting.raw_data_folder,"ref_map.ini");
    var content = fs.readFileSync(ini_file_path,'utf-8');
    var lines = content.split('\r\n');
    RawList.length = 0;
    RefList.length = 0;
    for(let i = 0;i < lines.length;i++){
        if(lines[i].startsWith('#') || lines[i].startsWith(';'))continue;
        let line_sp = lines[i].split(',');
        if(line_sp.length ==2){
            RawList.push(line_sp[0]);
            RefList.push(line_sp[1]);
        }
    }
}

function find_ref_file(raw_dir){
    let i = 0;
    for(i=0;i < RawList.length;i++){
        if(RawList[i] == raw_dir){
            break;
        }
    }
    return RefList[i];
}

module.exports = {
    load_ref_ini,
    find_ref_file,
    RawList,
    RefList,
}