close all;
clear;
clc;
res_folder = 'output\';
subf = strcat('..\',res_folder);
fid1=fopen(strcat(subf,'\rtk_statistic.txt'),'w');  
fprintf(fid1,'              dataset         rms-fix 50p-fix 68p-fix 95p-fix 99p-fix rms-flt 50p-flt 68p-flt 95p-flt 99p-flt 50p-all 68p-all 95p-all 99p-all fix rate num_all\n'); 

soldif.fixrate=[];
soldif.num_all=[];
soldif.rms_hor_fix=[];
soldif.rms_ver_fix=[];
soldif.rms_hor_flt=[];
soldif.rms_ver_flt=[];
soldif.hor_pos_all=[];
soldif.ver_pos_all=[];
soldif.hor_pos_flt=[];
soldif.ver_pos_flt=[];
soldif.hor_pos_fix=[];
soldif.ver_pos_fix=[];
soldif.hor_vel_all=[];
soldif.ver_vel_all=[];
ini_file='rtk.ini';
file1=read_ini_file(ini_file);

for id=1:length(file1)
    
    sol_ref=read_ref_file(file1(id).reffile);
    sol_rov=read_rov_file(file1(id).rovfile);
    filename=file1(id).rovfile;
   
    [soldif, pos_err, vel_err]= csvdif_analyze(sol_rov, sol_ref);
    
    mod_cdf=[1 0];
    ret = show_cdf_plot(soldif.hor_pos_err,soldif.ver_pos_err, mod_cdf, filename);
    
    mod_cep=[1 0];
    ret = show_cep_plot(soldif.hor_pos_all,soldif.ver_pos_all, mod_cep, filename);
    
    mod_ts=1;
%     ret = show_timeseries_plot(sol_1, mod_ts, filename);
    ret = show_csv_timeseries_plot(pos_err, mod_ts, filename);
    
    ret = compute_res_statistics(fid1, id, file1, soldif);

end

fclose(fid1);

quit();