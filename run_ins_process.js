const fs = require('fs');
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawnSync = require('child_process').spawnSync;
const setting = require('./config/process_setting.json');
const process_path = require('./config/process_path.json');
const ins_config_template = require('./config/ins_config_template.json');

const Json_Ext = ".json";
const Csv_Ext = ".csv";
const Rtcm_Rover_Header = "rtcm_rover_";
const Parameters_Header = "parameters_";
const User_Header = "user_";
const Process_End = "-process";
const Ins_config = "ins_config.json";
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

function read_parameters_json_file(dir,file){
    let file_path = path.join(dir,file);
    if(fs.existsSync(file_path)){
        let parameters = JSON.parse(fs.readFileSync(file_path));
        ins_config_template.priLeverArm[0] = 0;
        ins_config_template.priLeverArm[1] = 0;
        ins_config_template.priLeverArm[2] = 0;
        ins_config_template.userLeverArm[0] = 0;
        ins_config_template.userLeverArm[1] = 0;
        ins_config_template.userLeverArm[2] = 0;
        let arms = 0;
        for(let i in parameters){
            if("lever arm x" == parameters[i].name){
                ins_config_template.priLeverArm[0] = parameters[i].value;
                ins_config_template.userLeverArm[0] = parameters[i].value;
                arms++;
            }else if("lever arm y" == parameters[i].name){
                ins_config_template.priLeverArm[1] = parameters[i].value;
                ins_config_template.userLeverArm[1] = parameters[i].value;
                arms++;
            }else if("lever arm z" == parameters[i].name){
                ins_config_template.priLeverArm[2] = parameters[i].value;
                ins_config_template.userLeverArm[2] = parameters[i].value;
                arms++;
            }
            if(arms == 3) break;
        }
    }
}

function read_configuration_json_file(dir,file){
    let file_path = path.join(dir,file);
    if(fs.existsSync(file_path)){
        let configuration = JSON.parse(fs.readFileSync(file_path));
        ins_config_template.priLeverArm[0] = configuration.leverArmBx;
        ins_config_template.priLeverArm[1] = configuration.leverArmBy;
        ins_config_template.priLeverArm[2] = configuration.leverArmBz;
        ins_config_template.userLeverArm[0] = configuration.leverArmBx;
        ins_config_template.userLeverArm[1] = configuration.leverArmBy;
        ins_config_template.userLeverArm[2] = configuration.leverArmBz;
    }
}

function replace_gnss_line(gnss_line_sp,csv_line_sp){
    gnss_line_sp[3] = csv_line_sp[2];
    gnss_line_sp[4] = csv_line_sp[3];
    gnss_line_sp[5] = csv_line_sp[4];
    gnss_line_sp[6] = csv_line_sp[5];
    gnss_line_sp[7] = csv_line_sp[6];
    gnss_line_sp[8] = csv_line_sp[7];
    gnss_line_sp[9] = csv_line_sp[8];
}

function replace_vel_line(vel_line_sp,csv_line_sp){
    let north_vel = parseFloat(csv_line_sp[9]);
    let east_vel = parseFloat(csv_line_sp[10]);
    let up_vel = parseFloat(csv_line_sp[11]);
    vel_line_sp[3] = Math.sqrt(Math.pow(north_vel,2) +  Math.pow(east_vel,2)).toFixed(3);
    vel_line_sp[4] = csv_line_sp[12];
    vel_line_sp[5] = (-up_vel).toFixed(3);
}

function replace_process_file(indir,outdir,proc_file,csv_file){
    let proc_file_path = path.join(indir,proc_file);
    let csv_file_path = path.join(outdir,csv_file);
    ins_config_template.procfileNme = path.join(outdir,proc_file+"-new");
    ins_config_template.gnssfileNme = path.join(outdir,proc_file+"-gnssposvel.txt");
    ins_config_template.insfileName = path.join(outdir,proc_file+"-imu.txt");
    ins_config_template.odofileName = path.join(outdir,proc_file+"-odo.txt");
    if(fs.existsSync(proc_file_path) && fs.existsSync(csv_file_path)){
        var process_fd = fs.openSync(ins_config_template.procfileNme,"w");
        var proc_lines = fs.readFileSync(proc_file_path,"utf-8").split("\r\n");
        var csv_lines = fs.readFileSync(csv_file_path,"utf-8").split("\r\n");
        let i = 0;
        let process_start = 0;
        for(let j in csv_lines){
            let csv_line_sp = csv_lines[j].split(',');
            if(csv_line_sp.length >= 13){
                let csv_week = parseInt(csv_line_sp[0]);
                let csv_second = parseFloat(csv_line_sp[1]);
                for(;i < proc_lines.length;i++){
                    if(proc_lines[i].startsWith("$GPGNSS")){
                        let gnss_line_sp = proc_lines[i].split(',');
                        if(gnss_line_sp.length >= 10){
                            let gnss_week = parseInt(gnss_line_sp[1]);
                            let gnss_second = parseFloat(gnss_line_sp[2]);
                            if(csv_week != gnss_week){
                                break;
                            }else if(csv_second == gnss_second){
                                process_start = 1;//找到第一个匹配的时间就将 开始 设置成1
                                replace_gnss_line(gnss_line_sp,csv_line_sp);
                                fs.writeFileSync(process_fd,gnss_line_sp.join(',')+"\r\n");
                                //fs.writeFileSync(process_fd,proc_lines[i]+"\r\n");
                            }else if(csv_second < gnss_second){
                                break;
                            }
                        }
                    }else if(proc_lines[i].startsWith("$GPVEL")){
                        let vel_line_sp = proc_lines[i].split(',');
                        if(vel_line_sp.length >= 5){
                            let vel_week = parseInt(vel_line_sp[1]);
                            let vel_second = parseFloat(vel_line_sp[2]);
                            if(csv_week != vel_week){
                                break;
                            }else if(csv_second == vel_second){
                                replace_vel_line(vel_line_sp,csv_line_sp);
                                fs.writeFileSync(process_fd,vel_line_sp.join(',')+"\r\n");
                                break;
                            }else if(csv_second < vel_second){
                                break;
                            }
                        }
                    }else{
                        if(process_start == 1){
                            fs.writeFileSync(process_fd,proc_lines[i]+"\r\n");
                        }
                    }
                }
            }
        }
        fs.closeSync(process_fd);
    }
}

function find_process_file(dir,file,csv_file){
    let dir_path = path.join(dir,file);
    if(fs.existsSync(dir_path)){
        const files = fs.readdirSync(dir_path);
        for(let i in files){
            let file = files[i];
            if(file.endsWith(Process_End)){
                replace_process_file(dir_path,dir,file,csv_file);
                break;
            }           
        }
    }
}

function gen_ins_data_config(){
    process_path.List.forEach((dir,i) => {
        let indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        if(fs.existsSync(indir)){
            const files = fs.readdirSync(indir);
            let config_file = "";
            let param_file = "";
            let csv_file = "";
            let process_dir = "";
            for(let i in files){
                let file = files[i];
                if(fs.statSync(path.join(indir,file)).isDirectory() && file.startsWith(User_Header)){
                    process_dir = file;
                }else{
                    let ext = path.extname(file);
                    if("configuration.json" == file){
                        config_file = file;
                    }else if(Json_Ext == ext && file.startsWith(Parameters_Header)){
                        param_file = file;
                    }else if(Csv_Ext == ext && file.startsWith(Rtcm_Rover_Header)){
                        csv_file = file;
                    }
                }
                if(process_dir != "" && csv_file != "" && (config_file != "" || param_file != "")){
                    break;
                }
            }
            if(config_file != ""){
                read_configuration_json_file(indir,config_file);
            }else if(param_file != ""){
                read_parameters_json_file(indir,param_file)
            }
            if(process_dir != "" && csv_file != ""){
                find_process_file(indir,process_dir,csv_file);
            }
            let out_path = path.join(indir,Ins_config);
            fs.writeFileSync(out_path,JSON.stringify(ins_config_template,null, 4));
        }
    });
}

function ins_process(){
    process_path.List.forEach((dir,i) => {
        let indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        let ins_config_Path = path.join(indir,Ins_config);
        if(fs.existsSync(ins_config_Path)){
            spawnSync(bin_file,[ins_config_Path,"0"],{stdio: 'inherit'});
        }
    });
}

async function run(git_ver){
    const git_ver_bin = "INS-"+git_ver+".exe";
    const bin_file_dir = path.join(setting.workspace_root,setting.bin_file_folder,"INS");
    mkdirsSync(bin_file_dir);
    bin_file = path.join(bin_file_dir,git_ver_bin);
    if(fs.existsSync(setting.src_ins_exe)){
        //拷贝文件带有git版本号
        var cmd = `copy /Y ${setting.src_ins_exe} ${bin_file}`;
        console.log(cmd);
        await exec(cmd);
        //遍历生成配置文件
        gen_ins_data_config();
        //遍历并执行ins程序
        ins_process();
    }
}

module.exports ={
    run
}