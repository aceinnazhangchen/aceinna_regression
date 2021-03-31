function file=read_ini_file(ini_file)

fp=fopen(ini_file,'r');
if(fp==-1)   error('error to open the '+ ini_file); end

nc=0;
while(1)
    
 strTemp=fgets(fp);
 if (strTemp==-1) 
     break;
 end 
  data = regexp(strTemp, ',', 'split');
  nc=nc+1;
  file(nc).rovfile=char(data(2));
  file(nc).reffile=char(data(1));
end 

end 