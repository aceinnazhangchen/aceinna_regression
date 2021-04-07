function [soldif, pos_err, vel_err] = csvdif_analyze(sol_rov, sol_ref)

    pos1=find(sol_ref(:,3)==0.0);
    sol_ref(pos1,:)=[];
    [iscommon, irov, iref] = intersect(sol_rov(:,2),sol_ref(:,2));
    
    time=sol_rov(irov,2);
    
    WGS84=GetWGS84;
    M=RC_Meridian(WGS84.a, WGS84.e2, sol_ref(iref(1),3)/180*pi);
    N=RC_PrimeVertical(WGS84.a, WGS84.e2, sol_ref(iref(1),3)/180*pi);
    
    pos_err(:,1) = (sol_rov(irov,3)-sol_ref(iref,3)).*(M+sol_ref(iref,5)).*(pi/180);
    pos_err(:,2) = (sol_rov(irov,4)-sol_ref(iref,4)).*(N+sol_ref(iref,5)).*cos(sol_ref(iref,3)/180*pi).*(pi/180);
    pos_err(:,3) = (sol_rov(irov,5)-sol_ref(iref,5));
    hor_err = sqrt(pos_err(:,1).^2+ pos_err(:,2).^2);
    ver_err = abs(pos_err(:,3));
    
    vel_err     = sol_rov(irov,10:12)-sol_ref(iref,6:8);
    hor_vel_err = sqrt(vel_err(:,1).^2+ vel_err(:,2).^2);
    ver_vel_err = abs(vel_err(:,3));
    
    isfixed1= find(sol_rov(:,9)==4);
    fixed_rate = length(isfixed1)/length(irov);
    pos_flt     = find(sol_rov(irov,9)==5);
    pos_fix     = find(sol_rov(irov,9)==4);
    
    hor_err_flt =sort(hor_err(pos_flt));
    hor_err_fix =sort(hor_err(pos_fix));
    hor_err_all =sort(hor_err);
    
    ver_err_flt =sort(abs(ver_err(pos_flt)));
    ver_err_fix =sort(abs(ver_err(pos_fix)));
    ver_err_all =sort(abs(ver_err));
    
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
    hor_all  =[hor_50p_all hor_68p_all hor_95p_all hor_99p_all];
    
    ver_flt  =[ver_50p_flt ver_68p_flt ver_95p_flt ver_99p_flt];
    ver_fixed=[ver_50p_fix ver_68p_fix hor_95p_fix ver_99p_fix];
    ver_all  =[ver_50p_all ver_68p_all hor_95p_all ver_99p_all];
    
    soldif.rms_hor_fix     = rms_hor_fix;
    soldif.rms_ver_fix     = rms_ver_fix;
    soldif.rms_hor_flt     = rms_hor_flt;
    soldif.rms_ver_flt     = rms_ver_flt;
    soldif.hor_pos_flt     = hor_flt;
    soldif.hor_pos_fix     = hor_fixed;
    soldif.hor_pos_all     = hor_all;
    soldif.ver_pos_flt     = ver_flt;
    soldif.ver_pos_fix     = ver_fixed;
    soldif.ver_pos_all     = ver_all;
    soldif.hor_pos_err     = hor_err_all;
    soldif.ver_pos_err     = ver_err_all;
    soldif.hor_pos_err_fix = hor_err_fix;
    soldif.ver_pos_err_fix = ver_err_fix;
    soldif.hor_pos_err_flt = hor_err_flt;
    soldif.ver_pos_err_flt = ver_err_flt;
    soldif.hor_vel_err     = hor_vel_err;
    soldif.ver_vel_err     = ver_vel_err;   
    soldif.num_all         = num_all;
    soldif.fixrate         = fixed_rate;
         
end 