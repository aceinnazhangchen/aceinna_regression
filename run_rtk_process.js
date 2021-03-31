const fs = require('fs');
const path = require("path");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawnSync = require('child_process').spawnSync;
const pdf = require('./pdf/pdf.js');
const setting = require('./config/process_setting.json');
const process_path = require('./config/process_path.json');

const Rtcm_Rover_Header = "rtcm_rover_";
const Rtcm_Base_Header = "rtcm_base_";
const Bin_Ext = ".bin";
const Csv_Ext = ".csv";

var bin_file_dir = "";
var bin_file = "";
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
    var data_fd=fs.openSync(path.join(bin_file_dir,"data.ini"),"w");
    process_path.List.forEach((indir,i) => {
        indir = path.join(setting.workspace_root,setting.raw_data_folder,indir);
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
                let time_sp = rover_file.split("_");
                let year = time_sp[2],month = time_sp[3],day = time_sp[4];
                let doy = data2doy(parseInt(year),parseInt(month),parseInt(day));
                let line_str = util.format("4,%s\r\n",indir);
                fs.writeSync(data_fd,line_str);
                line_str =  util.format("1,%s,%s,0,0,0,%s,%s,0\r\n",rover_file,base_file,year,doy);
                fs.writeSync(data_fd,line_str);
            }
        } 
    });
    fs.closeSync(data_fd);
}

function move_result_data(git_ver){
    var matlab_fd = fs.openSync(path.join(matlab_script_path,"rtk.ini"),"w");
    var rtk_map = fs.readFileSync(path.join(__dirname,"config/rtk_map.ini"));
    var rtk_map_sp = rtk_map.toString().split('\r\n');
    process_path.List.forEach((dir,i) => {
        var indir = path.join(setting.workspace_root,setting.raw_data_folder,dir);
        var outdir = path.join(setting.workspace_root,setting.result_data_folder,git_ver,dir);
        if(fs.existsSync(indir)){
            mkdirsSync(outdir);
            const files = fs.readdirSync(indir);
            let out_csv_file = "";
            files.forEach((file,j) => {
                let ext = path.extname(file);
                if(Csv_Ext == ext || ".nmea" == ext || ".kml" == ext || ".kmz" == ext){
                    if(file.search(Rtcm_Rover_Header) == 0){
                        fs.renameSync(path.join(indir,file),path.join(outdir,file));//移动文件
                        //fs.copyFileSync(path.join(indir,file),path.join(outdir,file));//拷贝文件
                    }
                    if(Csv_Ext == ext){
                        out_csv_file = path.join(outdir,file);
                        for(let i = 0;i < rtk_map_sp.length; i++){
                            if(rtk_map_sp[i].search(file) == 0){
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
                if(Csv_Ext == ext && file.search(Rtcm_Rover_Header) == 0){
                    let basename = path.basename(file,Csv_Ext);
                    pdf.gen_pdf(outdir,basename+'.pdf',file);
                }
            });
        }
    });
}

async function run(){
    var args = process.argv.splice(2)
	console.log(args);
    let git_ver = args[0];
    mkdirsSync(path.join(__dirname,"output"));
    const git_ver_bin = "RTK-"+git_ver+".exe";
    //rtk执行文件目标目录
    bin_file_dir = path.join(setting.workspace_root,setting.bin_file_folder,"RTK");
    mkdirsSync(bin_file_dir);
    //rtk执行文件路径
    bin_file = path.join(bin_file_dir,git_ver_bin);
    //matlab脚本路径
    matlab_script_path = path.join(__dirname,'matlab_script');
    //拷贝文件带有git版本号
    var cmd = `copy /Y "${setting.src_rtk_exe}" "${bin_file}"`;
    console.log(cmd);
    await exec(cmd);
    //遍历生成配置文件
    gen_data_ini();
    //运行rtk后处理
    spawnSync(bin_file,[" > out.log"],{stdio: 'inherit',cwd:bin_file_dir});
    //将结果移动到结果文件夹
    move_result_data(git_ver);
    //运行matlab分析结果生成图表
    spawnSync('matlab',['-sd',matlab_script_path,'-wait','-noFigureWindows','-automation','-nosplash','-nodesktop','-r','main_rtk_csv_analyze','-logfile','../output/matlab.log'],{stdio: 'inherit'});
    //将结果图生成pdf
    gen_pdf_files(git_ver);
    console.log('OK');
}

run();