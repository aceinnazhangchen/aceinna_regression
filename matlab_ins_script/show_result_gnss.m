function   ret = show_result_gnss(gnssfilename,outputfilefolder,reffilename,cfg_info)
ret=1 ;
if ~exist(outputfilefolder,'dir')
    mkdir(outputfilefolder);
end

    rawgnss = load(gnssfilename);
    gnss_sol= convertgnss2sol(rawgnss);
    clear rawgnss;
    




rawref = load(reffilename);

ref = converttrue2true(rawref,(cfg_info.leverarm.ref2gnss));
clear rawref;
    mkdir([outputfilefolder 'gnss/']);
   Show_sol(1,gnss_sol,ref,cfg_info.dsc_nogs,cfg_info.t_nogps,[outputfilefolder 'gnss/']);
end
