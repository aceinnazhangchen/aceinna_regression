const fs = require('fs');
const path = require("path");
const spawnSync = require('child_process').spawnSync;
const pdf = require('./pdf/pdf.js');
const setting = require('./config/process_setting.json');
const process_path = require('./config/process_path.json');

const Csv_Ext = ".csv";
const Rtcm_Rover_Header = "rtcm_rover_";
var matlab_script_path = "";

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
    var matlab_fd = fs.openSync(path.join(matlab_script_path,"rtk.ini"),"w");
    var rtk_map_sp = fs.readFileSync(path.join(__dirname,"config/rtk_map.ini"),"utf-8").split('\r\n');
    process_path.List.forEach((dir,i) => {
        var indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        if(fs.existsSync(indir)){
            mkdirsSync(outdir);
            const files = fs.readdirSync(indir);
            let out_csv_file = "";
            files.forEach((file,j) => {
                let ext = path.extname(file);
                if(Csv_Ext == ext || ".nmea" == ext || ".kml" == ext || ".kmz" == ext || ".txt" == ext){
                    if(file.startsWith(Rtcm_Rover_Header)){
                        fs.renameSync(path.join(indir,file),path.join(outdir,file));//移动文件
                        //fs.copyFileSync(path.join(indir,file),path.join(outdir,file));//拷贝文件
                    }
                    if(Csv_Ext == ext){
                        out_csv_file = path.join(outdir,file);
                        for(let i = 0;i < rtk_map_sp.length; i++){
                            if(rtk_map_sp[i].startsWith(file)){
                                console.log(rtk_map_sp[i]);
                                let ref_file = rtk_map_sp[i].split(",")[1]; 
                                let ref_path = path.join(setting.workspace_root,setting.raw_data_folder,setting.ref_files_folder,ref_file);
                                if(fs.existsSync(ref_path)){
                                    let line_str = ref_path+","+out_csv_file+",1\r\n";
                                    fs.writeSync(matlab_fd,line_str);
                                }
                                break;
                            }
                        }
                    }
                }
            });
        }
    });
    fs.closeSync(matlab_fd);
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
    matlab_script_path = path.join(__dirname,'matlab_script');
    //将结果移动到结果文件夹
    move_result_data(git_ver);
    //运行matlab分析结果生成图表
    spawnSync('matlab',['-sd',matlab_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_rtk_csv_analyze','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    //将结果图生成pdf
    gen_pdf_files(git_ver);
}

module.exports = {
    run
}