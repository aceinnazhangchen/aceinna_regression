function [ret,cfg_info] = readconfig(cifgname)
fid_conf = fopen(cifgname,'rt');
if fid_conf == -1
    disp('Cannont open config file');
    ret = -1;
    return;
end
cout = 0;
while ~feof(fid_conf)
    line = fgetl(fid_conf);
    if(contains(line,'ref2'))
        if(contains(line,'gnss'))
            start_n = strfind(line,':');
            end_n = strfind(line,';');
            mid_n = strfind(line,',');
            cfg_info.leverarm.ref2gnss = [str2double(line(start_n(1)+1:mid_n(1)-1));...
                str2double(line(mid_n(1)+1:mid_n(2)-1));str2double(line(mid_n(2)+1:end_n(1)-1))];
            continue;
        end
        if(contains(line,'gnss'))
            start_n = strfind(line,':');
            end_n = strfind(line,';');
            mid_n = strfind(line,',');
            cfg_info.leverarm.ref2gnss = [str2double(line(start_n(1)+1:mid_n(1)-1));...
                str2double(line(mid_n(1)+1:mid_n(2)-1));str2double(line(mid_n(2)+1:end_n(1)-1))];
            continue;
        end
        if(contains(line,'imu'))
            start_n = strfind(line,':');
            end_n = strfind(line,';');
            mid_n = strfind(line,',');
            cfg_info.leverarm.ref2imu = [str2double(line(start_n(1)+1:mid_n(1)-1));...
                str2double(line(mid_n(1)+1:mid_n(2)-1));str2double(line(mid_n(2)+1:end_n(1)-1))];
            continue;
        end
        if(contains(line,'ublox'))
            start_n = strfind(line,':');
            end_n = strfind(line,';');
            mid_n = strfind(line,',');
            cfg_info.leverarm.ref2imu = [str2double(line(start_n(1)+1:mid_n(1)-1));...
                str2double(line(mid_n(1)+1:mid_n(2)-1));str2double(line(mid_n(2)+1:end_n(1)-1))];
            continue;
        end
        continue;
    end
    if(contains(line,':'))
        clear start_n end_n mid_n;
        cout = cout + 1;
        kv_sp = strsplit(line(1:strlength(line)-1),':');
        cfg_info.dsc_nogs(cout) = string(kv_sp(1));
        value_sp = strsplit(string(kv_sp(2)),',');
        cfg_info.t_nogps(cout,1) = str2double(value_sp(1));
        cfg_info.t_nogps(cout,2) = str2double(value_sp(2));
        cfg_info.t_nogps(cout,3) = str2double(value_sp(3));
        continue;
    end
end
ret = 1;
end