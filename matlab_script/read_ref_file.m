function sol_ref=read_ref_file(reffile)

 sol= load(reffile);
  
 pos=find(abs(sol(:,2)-round(abs(sol(:,2))))<1.0e-3);
 sol_ref = sol(pos,:);


end 