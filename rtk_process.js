const fs = require('fs');
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawnSync = require('child_process').spawnSync;
const setting = require('./config/process_setting.json');
const process_path = require('./config/process_path.json');

const git_ver_def = "1111111";
const Rtcm_Rover_Header = "rtcm_rover_";
const Rtcm_Base_Header = "rtcm_base_";
const Bin_Ext = ".bin";

var bin_file_dir = "";
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


function data2doy(year,month,day){
    const month_leapyear=[31,29,31,30,31,30,31,31,30,31,30,31];
    const month_notleap= [31,28,31,30,31,30,31,31,30,31,30,31];

    var doy=0;
    if (month > 1){
        if(year%4==0 && (year%100!=0 || year%400==0)){
            for(let i = 0;i < month-1; i++ ){
                doy+=month_leapyear[i]
            }   
        }
        else{
            for(let i = 0;i < month-1; i++ ){
                doy+=month_notleap[i]
            }   
        }
    }

    doy+=day
    return doy
}

function gen_data_ini(){
    var fd=fs.openSync("data.ini","w");
    process_path.RTK.forEach((indir,i) => {
        if(fs.existsSync(indir)){
            const files = fs.readdirSync(indir);
            var rover_file = "";
            var base_file = "";
            files.forEach((file,j) => {
                if(file.search(Rtcm_Rover_Header) == 0 && file.search(Bin_Ext) == file.length - Bin_Ext.length){
                    rover_file = file;
                }
                else if(file.search(Rtcm_Base_Header) == 0 && file.search(Bin_Ext) == file.length - Bin_Ext.length){
                    base_file = file;
                }
            });
            if(rover_file != "" && base_file != ""){
                var time_sp = rover_file.split("_");
                let year = time_sp[2],month = time_sp[3],day = time_sp[4];
                let doy = data2doy(parseInt(year),parseInt(month),parseInt(day));
                var line_str = util.format("4,%s\r\n",indir);
                fs.writeSync(fd,line_str);
                line_str =  util.format("1,%s,%s,0,0,0,%s,%s,0\r\n",rover_file,base_file,year,doy);
                fs.writeSync(fd,line_str);
            }
        } 
    });
    fs.closeSync(fd);
}

async function run(git_ver){
    var args = process.argv.splice(2)
	console.log(args);
    const git_ver_bin = "RTK-"+git_ver+".exe";
    bin_file_dir = path.join(setting.workspace_root,setting.bin_file_folder,"RTK");
    mkdirsSync(bin_file_dir);
    bin_file = path.join(bin_file_dir,git_ver_bin);
    //拷贝文件带有git版本号
    var cmd = `copy /Y ${setting.src_rtk_exe} ${bin_file}`;
    console.log(cmd);
    await exec(cmd);
    //遍历并执行程序
    // const raw_data_root = path.join(setting.workspace_root,setting.raw_data_folder);
    // walkInDir_process(raw_data_root,file_process);
    //生成配置文件
    gen_data_ini();
    cmd = `cd ${bin_file_dir}`;
    await exec(cmd);
    spawnSync(bin_file,[">out.log"],{stdio: 'inherit'});
}

run(git_ver_def);