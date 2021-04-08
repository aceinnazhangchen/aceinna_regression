const fs = require('fs');
const path = require("path");
const setting = require('../config/process_setting.json');
const map_ini = require("../load/map_ini.js");

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
      }
    }
}

function copy_config_files(){
    var from_root = path.join(setting.workspace_root,setting.raw_data_folder);
    var to_root = path.join(setting.workspace_root,"copy_temp");
    map_ini.RawList.forEach((dir,index) => {
        var from_dir = path.join(from_root,dir);
        var to_dir = path.join(to_root,dir);
        mkdirsSync(from_dir);
        mkdirsSync(to_dir);
        let file = 'time.txt';
        if(fs.existsSync(path.join(from_dir,file))){
            fs.copyFileSync(path.join(from_dir,file),path.join(to_dir,file));//拷贝文件
        }
        file = 'kml.jpg';
        if(fs.existsSync(path.join(from_dir,file))){
            fs.copyFileSync(path.join(from_dir,file),path.join(to_dir,file));//拷贝文件 
        }
    });
}

map_ini.load_ref_ini();
copy_config_files();