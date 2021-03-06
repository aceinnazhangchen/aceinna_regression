const fs = require('fs');
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawnSync = require('child_process').spawnSync;
const setting = require('./config/process_setting.json');
const map_ini = require("./load/map_ini.js");

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

function date2doy(year,month,day){
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
    var data_fd=fs.openSync(path.join(bin_file_dir,"data.ini"),"w");
    map_ini.RawList.forEach((indir,i) => {
        indir = path.join(setting.workspace_root,setting.raw_data_folder,indir);
        if(fs.existsSync(indir)){
            const files = fs.readdirSync(indir);
            var rover_file = "";
            var base_file = "";
            files.forEach((file,j) => {
                if(file.startsWith(Rtcm_Rover_Header) && file.endsWith(Bin_Ext)){
                    rover_file = file;
                }
                else if(file.startsWith(Rtcm_Base_Header) && file.endsWith(Bin_Ext)){
                    base_file = file;
                }
            });
            if(rover_file != "" && base_file != ""){
                let time_sp = rover_file.split("_");
                let year = time_sp[2],month = time_sp[3],day = time_sp[4];
                let doy = date2doy(parseInt(year),parseInt(month),parseInt(day));
                let line_str = util.format("4,%s\r\n",indir);
                fs.writeSync(data_fd,line_str);
                line_str =  util.format("1,%s,%s,0,0,0,%s,%s,0\r\n",rover_file,base_file,year,doy);
                fs.writeSync(data_fd,line_str);
            }
        } 
    });
    fs.closeSync(data_fd);
}

async function run(git_ver){
    mkdirsSync(path.join(__dirname,"output"));
    const git_ver_bin = "RTK-"+git_ver+".exe";
    //rtk????????????????????????
    bin_file_dir = path.join(setting.workspace_root,setting.bin_file_folder,"RTK");
    mkdirsSync(bin_file_dir);
    if(fs.existsSync(setting.src_rtk_exe)){
        //rtk??????????????????
        bin_file = path.join(bin_file_dir,git_ver_bin);
        //??????????????????git?????????
        var cmd = `copy /Y "${setting.src_rtk_exe}" "${bin_file}"`;
        console.log(cmd);
        await exec(cmd);
        //????????????????????????
        gen_data_ini();
        //??????rtk?????????
        spawnSync(bin_file,[" > out.log"],{stdio: 'inherit',cwd:bin_file_dir});
    }
}

module.exports ={
    run
}