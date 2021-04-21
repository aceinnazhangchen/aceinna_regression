function solall = compute_all_statistics(fid1, soldif)

    ret =1;   
    hor_pos_err_all=[];
    ver_pos_err_all=[];
    hor_pos_err_flt=[];
    ver_pos_err_flt=[];
    hor_pos_err_fix=[];
    ver_pos_err_fix=[];
    nf=length(soldif);
    for i=1:nf
      hor_pos_err_all=[hor_pos_err_all; soldif(i).hor_pos_err_all];
      ver_pos_err_all=[ver_pos_err_all; soldif(i).ver_pos_err_all];
      hor_pos_err_flt=[hor_pos_err_flt; soldif(i).hor_pos_err_flt];
      ver_pos_err_flt=[ver_pos_err_flt; soldif(i).ver_pos_err_flt];
      hor_pos_err_fix=[hor_pos_err_fix; soldif(i).hor_pos_err_fix];
      ver_pos_err_fix=[ver_pos_err_fix; soldif(i).ver_pos_err_fix];
    end 
    hor_pos_err_all = sort(hor_pos_err_all);
    ver_pos_err_all = sort(ver_pos_err_all);
    hor_pos_err_flt = sort(hor_pos_err_flt);
    ver_pos_err_flt = sort(ver_pos_err_flt);
    hor_pos_err_fix = sort(hor_pos_err_fix);
    ver_pos_err_fix = sort(ver_pos_err_fix);
    
    num_all = length(hor_pos_err_all);
    hor_50p_all = hor_pos_err_all(round(0.50*num_all));
    hor_68p_all = hor_pos_err_all(round(0.68*num_all));
    hor_95p_all = hor_pos_err_all(round(0.95*num_all));
    hor_99p_all = hor_pos_err_all(round(0.99*num_all));   
    ver_50p_all = ver_pos_err_all(round(0.50*num_all));
    ver_68p_all = ver_pos_err_all(round(0.68*num_all));
    ver_95p_all = ver_pos_err_all(round(0.95*num_all));
    ver_99p_all = ver_pos_err_all(round(0.99*num_all));
 
    num_flt =length(hor_pos_err_flt);
    num_fix =length(hor_pos_err_fix);
    if (num_flt>0)
        hor_50p_flt =hor_pos_err_flt(round(0.50*num_flt));
        hor_68p_flt =hor_pos_err_flt(round(0.68*num_flt));
        hor_95p_flt =hor_pos_err_flt(round(0.95*num_flt));
        hor_99p_flt =hor_pos_err_flt(round(0.99*num_flt));
        ver_50p_flt =ver_pos_err_flt(round(0.50*num_flt));
        ver_68p_flt =ver_pos_err_flt(round(0.68*num_flt));
        ver_95p_flt =ver_pos_err_flt(round(0.95*num_flt));
        ver_99p_flt =ver_pos_err_flt(round(0.99*num_flt));
    end 
    
    if (num_fix>0)
        hor_50p_fix =hor_pos_err_fix(round(0.50*num_fix));
        hor_68p_fix =hor_pos_err_fix(round(0.68*num_fix));
        hor_95p_fix =hor_pos_err_fix(round(0.95*num_fix));
        hor_99p_fix =hor_pos_err_fix(round(0.99*num_fix));
        ver_50p_fix =ver_pos_err_fix(round(0.50*num_fix));
        ver_68p_fix =ver_pos_err_fix(round(0.68*num_fix));
        ver_95p_fix =ver_pos_err_fix(round(0.95*num_fix));
        ver_99p_fix =ver_pos_err_fix(round(0.99*num_fix));
    end 
    
    hor_flt  =[hor_50p_flt hor_68p_flt hor_95p_flt hor_99p_flt];
    hor_fixed=[hor_50p_fix hor_68p_fix hor_95p_fix hor_99p_fix];
    hor_all  =[hor_50p_all hor_68p_all hor_95p_all hor_99p_all];  
    ver_flt  =[ver_50p_flt ver_68p_flt ver_95p_flt ver_99p_flt];
    ver_fixed=[ver_50p_fix ver_68p_fix ver_95p_fix ver_99p_fix];
    ver_all  =[ver_50p_all ver_68p_all ver_95p_all ver_99p_all];
    
    solall.hor_pos_err_all = hor_pos_err_all;
    solall.ver_pos_err_all = ver_pos_err_all;
    
    solall.fixrate = num_fix/num_all;
    solall.num_all= length(hor_pos_err_all);
    solall.hor_flt_cep=hor_flt;
    solall.hor_fix_cep=hor_fixed;
    solall.hor_all_cep=hor_all;
    solall.ver_flt_cep=ver_flt;
    solall.ver_fix_cep=ver_fixed;
    solall.ver_all_cep=ver_all;
    
    fprintf(fid1,'dataset,type,50p-fix,68p-fix,95p-fix,99p-fix, 50p-flt,68p-flt,95p-flt,99p-flt,50p-all,68p-all,95p-all,99p-all,fix rate,num_all\n'); 
    
    fprintf(fid1,',hpos, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.2f, %5d\n'...
    ,solall.hor_fix_cep(1),solall.hor_fix_cep(2),solall.hor_fix_cep(3), solall.hor_fix_cep(4)...
    ,solall.hor_flt_cep(1),solall.hor_flt_cep(2),solall.hor_flt_cep(3),solall.hor_flt_cep(4)...
    ,solall.hor_all_cep(1),solall.hor_all_cep(2),solall.hor_all_cep(3),solall.hor_all_cep(4),solall.fixrate*100.0,solall.num_all); 
                 
    fprintf(fid1,',vpos, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.3f, %6.2f, %5d\n'...
    ,solall.ver_fix_cep(1),solall.ver_fix_cep(2),solall.ver_fix_cep(3), solall.ver_fix_cep(4)...
    ,solall.ver_flt_cep(1),solall.ver_flt_cep(2),solall.ver_flt_cep(3),solall.ver_flt_cep(4)...
    ,solall.ver_all_cep(1),solall.ver_all_cep(2),solall.ver_all_cep(3),solall.ver_all_cep(4),solall.fixrate*100.0,solall.num_all); 

end 