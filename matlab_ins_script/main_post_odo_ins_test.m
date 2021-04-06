close all;
clear;
clc;

ini_file='ins.ini';
file1=read_ini_file(ini_file);

for id=1:length(file1)
    [ret,config] = readconfig(file1(id).timefile);
    if (1 == ret)
        show_result_ins([file1(id).outputfolder,file1(id).solfile],file1(id).outputfolder,file1(id).reffile,config); 
    end
end

 quit();