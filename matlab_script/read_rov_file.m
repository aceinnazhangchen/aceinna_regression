function sol_rov=read_rov_file(rovfile)

 sol= load(rovfile);

 pos=find(abs(sol(:,2)-round(abs(sol(:,2))))<1.0e-3);
 sol_rov = sol(pos,:);



end 