function [hor_err1, ver_err1, hor_flt, ver_flt, hor_fixed,...
         ver_fixed, hor_all,ver_all, fixed_rate, num_all, ...
         rms_hor_flt, rms_ver_flt, rms_hor_fix, rms_ver_fix] = nmeadif_analyze(sol_1)

    idx_1 = 1:length(sol_1);
    time1=sol_1(idx_1,1);
    hor_err = sqrt(sol_1(idx_1,5).^2+ sol_1(idx_1,6).^2);
    ver_err = sol_1(idx_1,7);
    isfixed = intersect(find(sol_1(idx_1,14)==4),find(sol_1(idx_1,15)>=1));
    isflt   = find(sol_1(idx_1,14)==5);
    sol_1b  = sol_1(isfixed,:);
    hor_err1 = hor_err(isfixed);
    ver_err1 = ver_err(isfixed);
    isfixed1= find(sol_1(idx_1,15)==4);
    fixed_rate = length(isfixed1)/length(sol_1);
    pos_flt     = find(sol_1b(:,15)==5);
    pos_fix     = find(sol_1b(:,15)==4);
    
    hor_err_flt =sort(hor_err1(pos_flt));
    hor_err_fix =sort(hor_err1(pos_fix));
    hor_err_all =sort(hor_err1);
    
    ver_err_flt =sort(abs(ver_err1(pos_flt)));
    ver_err_fix =sort(abs(ver_err1(pos_fix)));
    ver_err_all =sort(abs(ver_err1));
    
    num_flt=length(pos_flt);
    num_fix=length(pos_fix);
    num_all =length(hor_err_all);
    
    hor_50p_all =hor_err_all(round(0.50*num_all));
    hor_68p_all =hor_err_all(round(0.68*num_all));
    hor_95p_all =hor_err_all(round(0.95*num_all));
    hor_99p_all =hor_err_all(round(0.99*num_all));
    
    ver_50p_all =ver_err_all(round(0.50*num_all));
    ver_68p_all =ver_err_all(round(0.68*num_all));
    ver_95p_all =ver_err_all(round(0.95*num_all));
    ver_99p_all =ver_err_all(round(0.99*num_all));
    
    if (num_flt>0)
        rms_hor_flt=sqrt(sum(hor_err_flt.^2)/num_flt);
        rms_ver_flt=sqrt(sum(ver_err_flt.^2)/num_flt);
        hor_50p_flt =hor_err_flt(round(0.68*num_flt));
        hor_68p_flt =hor_err_flt(round(0.68*num_flt));
        hor_95p_flt =hor_err_flt(round(0.95*num_flt));
        hor_99p_flt =hor_err_flt(round(0.99*num_flt));
        ver_50p_flt =ver_err_flt(round(0.68*num_flt));
        ver_68p_flt =ver_err_flt(round(0.68*num_flt));
        ver_95p_flt =ver_err_flt(round(0.95*num_flt));
        ver_99p_flt =ver_err_flt(round(0.99*num_flt));
    end 
    
    if (num_fix>0)
        rms_hor_fix=sqrt(sum(hor_err_fix.^2)/num_fix);
        hor_50p_fix =hor_err_fix(round(0.5*num_fix));
        hor_68p_fix =hor_err_fix(round(0.68*num_fix));
        hor_95p_fix =hor_err_fix(round(0.95*num_fix));
        hor_99p_fix =hor_err_fix(round(0.99*num_fix));
        rms_ver_fix=sqrt(sum(ver_err_fix.^2)/num_fix);
        ver_50p_fix =ver_err_fix(round(0.5*num_fix));
        ver_68p_fix =ver_err_fix(round(0.68*num_fix));
        ver_95p_fix =ver_err_fix(round(0.95*num_fix));
        ver_99p_fix =ver_err_fix(round(0.99*num_fix));
    end 
    
    hor_flt  =[hor_50p_flt hor_68p_flt hor_95p_flt hor_99p_flt];
    hor_fixed=[hor_50p_fix hor_68p_fix hor_95p_fix hor_99p_fix];
    hor_all  =[hor_50p_all hor_68p_all hor_95p_fix hor_99p_all];
    
    ver_flt  =[ver_50p_flt ver_68p_flt ver_95p_flt ver_99p_flt];
    ver_fixed=[ver_50p_fix ver_68p_fix hor_95p_fix ver_99p_fix];
    ver_all  =[ver_50p_all ver_68p_all hor_95p_fix ver_99p_all];

end 