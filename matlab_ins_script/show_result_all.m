function   ret = show_result_all(imufilename,gnssfilename,solfilename,outputfilefolder,reffilename,cfg_info)
ret=1 ;
if ~exist(outputfilefolder,'dir')
    mkdir(outputfilefolder);
end
debug_filename = [outputfilefolder 'debug.txt'];
fp_debug = fopen(debug_filename,'wt');

if ~isempty(imufilename)
    rawimu = load(imufilename);
    imu = convertimu2imu(rawimu);
    clear rawimu;
    
    mkdir([outputfilefolder 'imu/']);
    Show_imu(imu,[outputfilefolder 'imu/'], fp_debug);
end

if ~isempty(gnssfilename)
    rawgnss = load(gnssfilename);
    gnss_sol= convertgnss2sol(rawgnss);
    clear rawgnss;
    
    mkdir([outputfilefolder 'gnss/']);
    %  Show_sol(1,gnss_sol,ref,cfg_info.dsc_nogs,cfg_info.t_nogps,[outputfilefolder 'gnss/']);
end


rawsol = load(solfilename);
%rawfil = load(filfilename);
rawref = load(reffilename);

ref = converttrue2true(rawref,(cfg_info.leverarm.ref2gnss));
clear rawref;

sol = convertsol2sol(rawsol);
clear rawsol;
% fil = convertfil2fil(rawfil);

mkdir([outputfilefolder 'ins/']);
Show_sol(4,sol,ref,cfg_info.dsc_nogs,cfg_info.t_nogps,[outputfilefolder 'ins/']);
fclose(fp_debug);
end
