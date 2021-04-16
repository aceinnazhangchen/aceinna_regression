const fs = require('fs');
const path = require("path");
const spawnSync = require('child_process').spawnSync;
const pdf = require('./pdf/pdf.js');
const setting = require('./config/process_setting.json');
const map_ini = require("./load/map_ini.js");
const xlsx = require('node-xlsx');
const util = require('util');

const Csv_Ext = ".csv";
const Rtcm_Rover_Header = "rtcm_rover_";
var matlab_rtk_script_path = "";
var matlab_ins_script_path = "";

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

function move_result_data(git_ver){
    map_ini.RawList.forEach((dir,index) => {
        var indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        if(fs.existsSync(indir)){
            mkdirsSync(outdir);
            const files = fs.readdirSync(indir);
            files.forEach((file,index2) => {
                let ext = path.extname(file);
                if(Csv_Ext == ext || ".nmea" == ext || ".kml" == ext || ".kmz" == ext || ".txt" == ext){
                    if(file != "time.txt"){
                        fs.renameSync(path.join(indir,file),path.join(outdir,file));//移动文件
                        //fs.copyFileSync(path.join(indir,file),path.join(outdir,file));//拷贝文件
                    }
                }else if(".jpg" == ext || ".xlsx" == ext){
                    fs.copyFileSync(path.join(indir,file),path.join(outdir,file));//拷贝文件
                }
            });
        }
    });
}

function gen_time_txt(dir){
    const execlFile = path.join(dir, 'requirement.xlsx');
    if(fs.existsSync(execlFile)){
        const workSheets = xlsx.parse(execlFile);
        const sheet = workSheets[0];
        var lines = [];
        for(let i = 1;i <sheet.data.length; i++){
            if(sheet.data[i].length >= 8){
                if(sheet.data[i][6] != null && sheet.data[i][7] != null){
                    let line = util.format("%s:%d,%d,%d",sheet.data[i][0],sheet.data[i][6],sheet.data[i][7],sheet.data[i][1]);
                    lines.push(line);
                }
            }            
        }
        lines.push("ref2gnss:0.0,0.0,0.0");
        lines.push("ref2imu:0.0,0.0,0.0");
        lines.push("ref2ublox:0.0,0.0,0.0");
        fs.writeFileSync(path.join(dir, 'time.txt'),lines.join("\r\n"));
    }
}

function gen_matlab_config(git_ver){
    var matlab_rtk_fd = fs.openSync(path.join(matlab_rtk_script_path,"rtk.ini"),"w");
    var matlab_ins_fd = fs.openSync(path.join(matlab_ins_script_path,"ins.ini"),"w");
    var ver_result_dir = path.join(setting.workspace_root,setting.result_data_folder,git_ver);
    let line_str = "all,all,"+ver_result_dir+"\\,0\r\n";
    fs.writeSync(matlab_rtk_fd,line_str);
    map_ini.RawList.forEach((dir,index) => {
        var indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        gen_time_txt(indir);
        if(fs.existsSync(outdir)){   
            const files = fs.readdirSync(outdir);
            let csv_file = "";
            let odo_file = "";
            let ref_file = map_ini.find_ref_file(dir);
            let ref_path = path.join(setting.workspace_root,setting.raw_data_folder,setting.ref_files_folder,ref_file);
            for(let i in files){
                let file = files[i];
                let ext = path.extname(file);
                if(Csv_Ext == ext){
                    csv_file = file;
                }else if(file.endsWith("_result.txt")){
                    odo_file = file;
                }
                if(csv_file != "" && odo_file != ""){
                    break;
                }
            }
            if(csv_file != "" && odo_file != "" && ref_path != ""){
                if(fs.existsSync(ref_path)){
                    line_str = ref_path+","+csv_file+","+outdir+"\\,1\r\n";
                    fs.writeSync(matlab_rtk_fd,line_str);
                    line_str = outdir+"\\,"+odo_file+","+path.join(indir,"time.txt")+","+ref_path+"\r\n";
                    fs.writeSync(matlab_ins_fd,line_str);
                }
            }
        }
    });
    fs.closeSync(matlab_rtk_fd);
    fs.closeSync(matlab_ins_fd);
}

function gen_pdf_files(git_ver){
    const gitRoot = path.join(setting.workspace_root,setting.result_data_folder,git_ver);
    map_ini.RawList.forEach((dir,i) => {
        var outdir = path.join(gitRoot,dir);
        if(fs.existsSync(outdir)){
            const files = fs.readdirSync(outdir);
            files.forEach((file,j) => {
                let ext = path.extname(file);                
                if(Csv_Ext == ext && file.startsWith(Rtcm_Rover_Header)){
                    let basename = path.basename(file,Csv_Ext);
                    pdf.gen_single_pdf(outdir,basename+'.pdf',file);
                }
            });
        }
    });

    pdf.gen_full_pdf(gitRoot, 'OpenRTK_regression.pdf');
}

function merge_ins_csv(git_ver){
    const Column = 39;
    let header1 = "";
    let header2 = ""
    let sum_array = [];
    for(let i = 0;i < 2;i++){
        let arr = []
        for(let j = 1;j< Column;j++){
            if(j < 3){
                arr[j] = "";
            }
            else{
                arr[j] = 0.0;
            }
        }
        sum_array[i] = arr;
    }
    let count = 0;
    map_ini.RawList.forEach((dir,i) => {
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        var csv_path = path.join(outdir,'ins','result.csv');
        if(fs.existsSync(csv_path)){
            //console.log(csv_path);
            let content = fs.readFileSync(csv_path,'utf-8');
            let lines = content.split('\r\n');
            if(header1 == "" && header2 == ""){
                header1 = lines[0];
                header2 = lines[1];
            }
            let data_lines = lines.slice(2);
            for(let i = 0;i < data_lines.length && i < 2;i++){
                let data_sp = data_lines[i].split(',');
                if(data_sp.length > Column){
                    sum_array[i][0] = data_sp[0];
                    for(let j = 3;j < Column;j++){
                        sum_array[i][j] = sum_array[i][j] + parseFloat(data_sp[j]);              
                    }
                }
            }
            //console.log(sum_array);
            count++;
        }        
    });
    var csv_fd = fs.openSync(path.join(setting.workspace_root,setting.result_data_folder,git_ver,"all_ins_average.csv"),"w");
    fs.writeSync(csv_fd,header1+'\r\n');
    fs.writeSync(csv_fd,header2+'\r\n');
    if(count > 0){
        for(let i = 0;i < 2;i++){
            for(let j = 3;j< Column;j++){
                sum_array[i][j] = sum_array[i][j]/count;
                sum_array[i][j] = sum_array[i][j].toFixed(2);
            }
            fs.writeSync(csv_fd,sum_array[i].join(',')+'\r\n');
        }
    }
    fs.closeSync(csv_fd);
}

async function run(git_ver){
    //matlab脚本路径
    matlab_rtk_script_path = path.join(__dirname,'matlab_rtk_script');
    matlab_ins_script_path = path.join(__dirname,'matlab_ins_script');
    //将结果移动到结果文件夹
    move_result_data(git_ver);
    //生成matlab配置文件
    gen_matlab_config(git_ver);
    //运行matlab分析结果生成图表
    spawnSync('matlab',['-sd',matlab_rtk_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_rtk_csv_analyze','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    spawnSync('matlab',['-sd',matlab_ins_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_post_odo_ins_test','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    //合并ins的csv取平均
    merge_ins_csv(git_ver);
    //将结果图生成pdf
    gen_pdf_files(git_ver);
}

module.exports = {
    run
}