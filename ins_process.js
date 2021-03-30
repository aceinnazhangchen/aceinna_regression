const fs = require('fs');
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawnSync = require('child_process').spawnSync;
const setting = require('./config/process_setting.json');

const git_ver_def = "1111111";
var bin_file = "";

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

function replease_local_path(parent_dir,fileName){
    let date_basename = path.basename(parent_dir);
    let fileName_sp = fileName.split(date_basename);
    if(fileName_sp.length > 0){
        fileName = path.join(parent_dir,fileName_sp[fileName_sp.length -1]);
    }
    return fileName;
}

function file_process(parent_dir,item){
    if("postprocess" != item) return false;
    let fullPath = path.join(parent_dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isFile())  return false;
    let process_config_file_Path = path.join(fullPath,setting.ins_config_file);
    if(fs.existsSync(process_config_file_Path) == false) return false;
    let process_config = JSON.parse(fs.readFileSync(process_config_file_Path));
    process_config.procfileNme = replease_local_path(parent_dir,process_config.procfileNme);
    process_config.gnssfileNme = replease_local_path(parent_dir,process_config.gnssfileNme);
    process_config.insfileName = replease_local_path(parent_dir,process_config.insfileName);
    process_config.odofileName = replease_local_path(parent_dir,process_config.odofileName);
    //console.log(process_config);
    var jsonString = JSON.stringify(process_config,null,4);
    //console.log(jsonString);
    fs.writeFileSync(process_config_file_Path,jsonString);
    console.log(bin_file,process_config_file_Path,"0");
    spawnSync(bin_file,[process_config_file_Path,"0"],{stdio: 'inherit'});
}

function walkInDir_process(indir,process_func) {
    const files = fs.readdirSync(indir);
    //console.log(files);
    files.forEach((item, index) => {
        if(process_func(indir,item) == false){
            var fullPath = path.join(indir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()){
                walkInDir_process(path.join(indir, item),process_func);
            }
        }     
    });
}

async function run(git_ver){
    var args = process.argv.splice(2)
	console.log(args);
    const git_ver_bin = "INS-"+git_ver+".exe";
    const bin_file_dir = path.join(setting.workspace_root,setting.bin_file_folder,"INS");
    mkdirsSync(bin_file_dir);
    bin_file = path.join(bin_file_dir,git_ver_bin);
    //拷贝文件带有git版本号
    var cmd = `copy /Y ${setting.src_ins_exe} ${bin_file}`;
    console.log(cmd);
    await exec(cmd);
    //遍历并执行程序
    const raw_data_root = path.join(setting.workspace_root,setting.raw_data_folder);
    walkInDir_process(raw_data_root,file_process);
}

run(git_ver_def);