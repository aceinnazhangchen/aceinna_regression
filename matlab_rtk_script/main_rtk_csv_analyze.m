close all;
clear;
clc;

subf = '..\output\';
ini_file='rtk.ini';
file1=read_ini_file(ini_file);
nf =length(file1);
for id=2:nf
    fid1=fopen(strcat(file1(id).outdir,'\rtk_statistic.txt'),'w');  
    fprintf(fid1,'dataset,type,50p-fix,68p-fix,95p-fix,99p-fix, 50p-flt,68p-flt,95p-flt,99p-flt,50p-all,68p-all,95p-all,99p-all,fix rate,num_all\n'); 
    filename=strcat(file1(id).outdir,file1(id).rovfile);
    sol_ref=read_ref_file(file1(id).reffile);
    sol_rov=read_rov_file(filename);
 
    [sol, pos_err, vel_err]= csvdif_analyze(sol_rov, sol_ref);
    
    mod_cdf=[1 0];
    ret = show_cdf_plot(sol.hor_pos_err,sol.ver_pos_err, mod_cdf, filename);
    
    mod_cep=[1 0];
    ret = show_cep_plot(sol.hor_pos_all,sol.ver_pos_all, mod_cep, filename);
    
    mod_ts=1;
    ret = show_csv_timeseries_plot(pos_err, mod_ts, filename);
    
    ret = compute_res_statistics(fid1, id, file1, sol);
    
    soldif(id).fixrate=sol.fixrate;
    soldif(id).num_all=sol.num_all;
    soldif(id).rms_hor_fix=sol.rms_hor_fix;
    soldif(id).rms_ver_fix=sol.rms_ver_fix;
    soldif(id).rms_hor_flt=sol.rms_hor_flt;
    soldif(id).rms_ver_flt=sol.rms_ver_flt;
    soldif(id).hor_pos_all_cep=sol.hor_pos_all;
    soldif(id).ver_pos_all_cep=sol.ver_pos_all;
    soldif(id).hor_pos_flt_cep=sol.hor_pos_flt;
    soldif(id).ver_pos_flt_cep=sol.ver_pos_flt;
    soldif(id).hor_pos_fix_cep=sol.hor_pos_fix;
    soldif(id).ver_pos_fix_cep=sol.ver_pos_fix;
    soldif(id).hor_pos_err_all = sol.hor_pos_err;
    soldif(id).ver_pos_err_all = sol.ver_pos_err;
    soldif(id).hor_pos_err_fix = sol.hor_pos_err_fix;
    soldif(id).ver_pos_err_fix = sol.ver_pos_err_fix;
    soldif(id).hor_pos_err_flt = sol.hor_pos_err_flt;
    soldif(id).ver_pos_err_flt = sol.ver_pos_err_flt;
    soldif(id).hor_vel_err     = sol.hor_vel_err;
    soldif(id).ver_vel_err     = sol.ver_vel_err;  
   
%     soldif(id).hor_vel_all=sol.hor_vel_all;
%     soldif(id).ver_vel_all=sol.ver_vel_all;
    fclose(fid1);
end

if nf > 1
    fid2=fopen(strcat(file1(1).outdir,'all_statistics.csv'),'w');  
    filename2=strcat(file1(1).outdir, 'all_res');

    solall.hor_pos_err_all=[];
    solall.ver_pos_err_all=[];
    solall.hor_flt_cep=[];
    solall.hor_fix_cep=[];
    solall.hor_all_cep=[];
    solall.ver_flt_cep=[];
    solall.ver_fix_cep=[];
    solall.ver_all_cep=[];

    solall= compute_all_statistics(fid2, soldif);

    mod_cdf=[1 0];
    ret = show_cdf_plot(solall.hor_pos_err_all,solall.ver_pos_err_all, mod_cdf,filename2);

    mod_cep=[1 0]; 
    ret = show_cep_plot(solall.hor_all_cep,solall.ver_all_cep, mod_cep,filename2);

    fclose(fid2);
end