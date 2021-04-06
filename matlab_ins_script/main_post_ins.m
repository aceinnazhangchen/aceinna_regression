% analyze OpenRTK330LI real time  ins solution
% input: 
close all;
clear;
clc;
filesname = 'E:/test/exp/Process/2021/027/WUXI_03/';
filesnamelist = dir(filesname);
filesize = size(filesnamelist,1);
find_ref = 0; find_config = 0;
for i = 1 : (filesize - 2)
    filesnamelist(i+2).name
    if(strfind(filesnamelist(i+2).name,'reference'))
        find_ref =1;
        refnamefolder = [filesname filesnamelist(i+2).name '/'];
        refnamefolderlist = dir(refnamefolder);
        cfg.refname = [refnamefolder refnamefolderlist(3).name]; 

    elseif(strfind(filesnamelist(i+2).name,'time.txt'))
        cfg.cifgname = [filesnamelist(i+2).name];
        [ret,cfg.cfg_info] = readconfig([filesname cfg.cifgname]);
        if (1 == ret)
            find_config =1;
        end         
    end
    
    if(1 == find_ref && 1 == find_config)
       break; 
    end
    
end
    
if(1 == find_ref && 1 == find_config)
   for i = 1 : (filesize - 2)
      if(strfind(filesnamelist(i+2).name,'dev'))
        devnamefolder = [filesname filesnamelist(i+2).name '/'];
        devnamefolderlist = dir(devnamefolder);
        filesize2 = size(devnamefolderlist,1);
        need_to_be = 0;
        for k = 1 : (filesize2 - 2)
             if(strfind(devnamefolderlist(k+2).name,'_result.txt'))
                 cfg.solfilename = [devnamefolder devnamefolderlist(k+2).name];
                 cfg.solfilename
                 need_to_be =need_to_be + 1;
                 continue;
             end
        end
        if (1 <= need_to_be)
            %填入需要输入的文件名，以及需要输出的文件夹
            k = strfind(filesname,'/');
            cfg.outputfilefolder = [filesname(1:k(end-1)) filesname(k(end-1):k(end)) 'postresult/' filesnamelist(i+2).name  '/'];
            show_result_ins(cfg.solfilename,cfg.outputfilefolder,cfg.refname,cfg.cfg_info); 
        end          
    end
   end
else
    disp('No ref or config file found');
end

    
% end
