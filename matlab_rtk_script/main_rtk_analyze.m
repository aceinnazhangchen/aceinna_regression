close all;
clear;
clc;

res_folder = 'OpenRTK330\inceptio_0325\';
subf = strcat('..\',res_folder);
dataset_tag = 'OpenRTK330';
file1=dir(fullfile(subf,'*.dif'));
file2=dir(fullfile(subf,'*.csv'));
fid1=fopen(strcat(subf,'\rtk_statistic.txt'),'w');  
fprintf(fid1,'              dataset         rms-fix 50p-fix 68p-fix 95p-fix 99p-fix rms-flt 50p-flt 68p-flt 95p-flt 99p-flt 50p-all 68p-all 95p-all 99p-all fix rate num_all\n'); 
hposerr_alds=[];
rms_hor_flt=0.0;
rms_ver_flt=0.0;
hor_50p_flt =0.0;
hor_68p_flt =0.0;
hor_95p_flt =0.0;
hor_99p_flt =0.0;
ver_50p_flt =0.0;
ver_68p_flt =0.0;
ver_95p_flt =0.0;
ver_99p_flt =0.0;
        
for id=1:length(file1)

    sol_1 = load(['.\', subf, '\',file1(id).name]);
    ss = strsplit(file1(id).name, '.csv');
    dataset_tag =ss;
    dataset_tag = strrep(dataset_tag, '_', '-');
    
    filename=strcat(subf, file1(id).name);
   
    [hor_err, ver_err, hor_flt, ver_flt, hor_fixed,ver_fixed, hor_all,ver_all, fixed_rate, num_all,...
     rms_hor_flt, rms_ver_flt, rms_hor_fix, rms_ver_fix]  = nmeadif_analyze(sol_1);
    
    mod_cdf=[1 0];
    ret = show_cdf_plot(hor_err,ver_err, mod_cdf, filename);
    
    mod_cep=[1 0];
    ret = show_cep_plot(hor_all,ver_all, mod_cep, filename);
    
    mod_ts=1;
    ret = show_timeseries_plot(sol_1, mod_ts, filename);
    
    fprintf(fid1,'%25s %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.3f %6.2f %5d\n',...
    file1(id).name(end-23:end),rms_hor_fix,hor_fixed(1),hor_fixed(2),hor_fixed(3), hor_fixed(4)...
                              ,rms_hor_flt,hor_flt(1),hor_flt(2),hor_flt(3), hor_flt(4)...
                              ,hor_all(1),hor_all(2),hor_all(3),hor_all(4),fixed_rate*100.0,num_all); 

end

fclose(fid1);