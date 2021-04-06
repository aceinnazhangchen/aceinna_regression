function   ret = show_result_ins(solfilename,outputfilefolder,reffilename,cfg_info)
ret=1 ;
if ~exist(outputfilefolder,'dir')
    mkdir(outputfilefolder);
end
rawsol = load(solfilename);
rawref = load(reffilename);

ref = converttrue2true(rawref,(cfg_info.leverarm.ref2gnss));
clear rawref;

sol = convertsol2sol(rawsol);
clear rawsol;

mkdir([outputfilefolder 'ins/']);
Show_sol(4,sol,ref,cfg_info.dsc_nogs,cfg_info.t_nogps,[outputfilefolder 'ins/']);
end
