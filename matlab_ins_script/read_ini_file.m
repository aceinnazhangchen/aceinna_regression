function file=read_ini_file(ini_file)

fp=fopen(ini_file,'r');
if(fp==-1)   error('error to open the '+ ini_file); end

nc=0;
while(1)
    
 strTemp=fgetl(fp);
 if (strTemp==-1) 
     break;
 end 
  data = regexp(strTemp, ',', 'split');
  nc=nc+1;
  file(nc).outputfolder=char(data(1));
  file(nc).solfile=char(data(2));
  file(nc).timefile=char(data(3));
  file(nc).reffile=char(data(4));
end 

end 