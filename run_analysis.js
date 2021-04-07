const fs = require('fs');
const path = require("path");
const spawnSync = require('child_process').spawnSync;
const pdf = require('./pdf/pdf.js');
const setting = require('./config/process_setting.json');
const process_path = require('./config/process_path.json');

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
    process_path.List.forEach((dir,index) => {
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
                }else if(".jpg" == ext){
                    fs.copyFileSync(path.join(indir,file),path.join(outdir,file));//拷贝文件
                }
            });
        }
    });
}

function find_ref_file(rtk_map_sp,file){
    let ref_path = "";  
    for(let j = 0;j < rtk_map_sp.length; j++){
        if(rtk_map_sp[j].startsWith(file)){
            let ref_file = rtk_map_sp[j].split(",")[1]; 
            ref_path = path.join(setting.workspace_root,setting.raw_data_folder,setting.ref_files_folder,ref_file);
            break;
        }
    }
    return ref_path;
}

function gen_matlab_config(git_ver){
    var matlab_rtk_fd = fs.openSync(path.join(matlab_rtk_script_path,"rtk.ini"),"w");
    var matlab_ins_fd = fs.openSync(path.join(matlab_ins_script_path,"ins.ini"),"w");
    var rtk_map_sp = fs.readFileSync(path.join(__dirname,"config/ref_map.ini"),"utf-8").split('\r\n');
    var ver_result_dir = path.join(setting.workspace_root,setting.result_data_folder,git_ver);
    let line_str = "all,all,"+ver_result_dir+"\\,0\r\n";
    fs.writeSync(matlab_rtk_fd,line_str);
    process_path.List.forEach((dir,index) => {
        var indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        if(fs.existsSync(outdir)){
            const files = fs.readdirSync(outdir);
            let csv_file = "";
            let odo_file = "";
            let ref_path = "";
            for(let i in files){
                let file = files[i];
                let ext = path.extname(file);
                if(Csv_Ext == ext){
                    csv_file = file;
                    ref_path = find_ref_file(rtk_map_sp,file);
                }else if(file.endsWith("_result_odo.txt")){
                    odo_file = file;
                }
                if(csv_file != "" && odo_file != "" && ref_path != ""){
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
    process_path.List.forEach((dir,i) => {
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        if(fs.existsSync(outdir)){
            const files = fs.readdirSync(outdir);
            files.forEach((file,j) => {
                let ext = path.extname(file);                
                if(Csv_Ext == ext && file.startsWith(Rtcm_Rover_Header)){
                    let basename = path.basename(file,Csv_Ext);
                    pdf.gen_pdf(outdir,basename+'.pdf',file);
                }
            });
        }
    });
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
    //spawnSync('matlab',['-sd',matlab_rtk_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_rtk_csv_analyze','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    //spawnSync('matlab',['-sd',matlab_ins_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_post_odo_ins_test','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    //将结果图生成pdf
    //gen_pdf_files(git_ver);
}

module.exports = {
    run
}