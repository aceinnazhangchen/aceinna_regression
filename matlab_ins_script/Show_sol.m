function Show_sol(type,sol,ref,dsc_nogs,t_nogps,filefolder)
%数据对齐
t_process = t_nogps(1,:);  %数据处理时间段
t_cut = t_process;         %数据分析时间段，此处一致

idx = strfind(filefolder, 'dev_');
sys_name = filefolder(idx+4:idx+10);

t_start = t_process(1);
t_end = t_process(2);
N_sol = sol(:,1)>=t_start & sol(:,1)<=t_end;
sol_c = sol(N_sol,:);
if(type ==1) 
t_dt = 1;
else
    t_dt = mean(diff(sol(:,1)));
end

%将参考投影到imu时间点
true_c = interp1(ref(:,1),ref,sol_c(:,1),'linear');
if (type >= 3)
    true_c(:,10)=interp1_Azimuth(ref(:,1),ref(:,10)-2*pi,sol_c(:,1));
end

%坐标系变换，起始位置按照参考首位置
WGS84=GetWGS84;
M=RC_Meridian(WGS84.a, WGS84.e2, true_c(1,2));
N=RC_PrimeVertical(WGS84.a, WGS84.e2, true_c(1,2));
r_N_sol=(sol_c(:,2)-true_c(1,2))*(M+sol_c(1,4));
r_E_sol=(sol_c(:,3)-true_c(1,3))*(N+sol_c(1,4))*cos(sol_c(1,2));
r_N_true=(true_c(:,2)-true_c(1,2))*(M+true_c(1,4));
r_E_true=(true_c(:,3)-true_c(1,3))*(N+true_c(1,4))*cos(true_c(1,2));

t_shift=floor(true_c(1,1)/10000)*10000;
t_disp=sol_c(:,1)-t_shift;

%求解导航误差
error_r = [ r_N_sol-r_N_true, r_E_sol-r_E_true, sol_c(:,4)-true_c(:,4)];
error_v(:,1:2) = sol_c(:,5:6)-true_c(:,5:6);
error_v(:,3) = sol_c(:,7)+true_c(:,7);

az_limit=pi;
azimuth_error = sol_c(:,10)-true_c(:,10);
I1=find(azimuth_error<-(2*pi-az_limit));
azimuth_error(I1)=azimuth_error(I1)+2*pi;
I2=find(azimuth_error>+(2*pi-az_limit));
azimuth_error(I2)=azimuth_error(I2)-2*pi;
error_A=[sol_c(:,8:9)-true_c(:,8:9) azimuth_error] *180/pi;
% error_A(:,1) = error_A(:,1) - mean(error_A(:,1));
% error_A(:,2) = error_A(:,2) - mean(error_A(:,2));
% error_A(:,3) = error_A(:,3) - mean(error_A(:,3));
error=[sol_c(:,1) error_r  error_v error_A];

%保存误差文件
fid_error =  fopen([filefolder 'error.bin'],'wb');
fwrite(fid_error,error,'double');
fclose(fid_error);
%全场景图和误差曲线
[N_nogps,temp]=size(t_nogps);
if N_nogps~=0&&N_nogps~=1
    n_nogps=find( sol_c(:,1)>=t_nogps(2,1) & sol_c(:,1)<=t_nogps(2,2) );
    for i=3:N_nogps
        n_nogps=[ n_nogps; find( sol_c(:,1)>=t_nogps(i,1) & sol_c(:,1)<=t_nogps(i,2) ) ];
    end
end

fh = figure('Visible','on'),
plot3( r_E_true, r_N_true, t_disp, 'g-', 'linewidth', 1), view(0,90);
hold on,
plot3( r_E_sol, r_N_sol, t_disp, 'm-','linewidth', 1),
if N_nogps~=0
    plot3( r_E_sol(n_nogps), r_N_sol(n_nogps), t_disp(n_nogps,1), 'r*','linewidth', 2);
end
view(0,90); grid on, axis equal;
xlabel('East (m)'), ylabel('North (m)'), title(sys_name, 'Interpreter', 'None');
if N_nogps~=0
    legend('True','IMU/GPS','scenary'),
else
    legend('True','IMU/GPS'),
end
saveas(fh,[filefolder 'trajectory']);

fh = figure('Visible','on'),
subplot(311), plot(t_disp,error_r),
ylabel('Position Error (m)'), title(sys_name, 'Interpreter', 'None'), grid on;
temp=axis;
% hold on, plot(t_disp,norm_P1+temp(3),'k:'), hold off,
legend('North','East','Down','Location','EastOutside'),
if N_nogps~=0;
    hold on, plot(t_disp(n_nogps),zeros(size(t_disp(n_nogps)))+temp(3),'cx','linewidth',3); %legend('North','East','Height','GPS gaps'),
    hold off,
end
xlabel(['GPS Time - ' int2str(t_shift) ' (sec)']),

subplot(312), plot(t_disp,error_v),
ylabel('Velocity Error (m/s)'), grid on;
temp=axis;
%hold on, plot(t_disp, norm_P2+temp(3), 'k:'), hold off,
legend('V_N','V_E','V_D','Location','EastOutside'),
xlabel(['GPS Time - ' int2str(t_shift) ' (sec)']),
subplot(313), plot(t_disp,error_A),
temp=axis;
%hold on, plot(t_disp,sol(:,17:19)*180/pi+temp(3),':'), hold off,
ylabel('Attitude Error (deg)'), legend('Roll','Pitch','Yaw','Location','EastOutside'), grid on;
xlabel(['GPS Time - ' int2str(t_shift) ' (sec)']);
saveas(fh,[filefolder 'Errorcurve']);
%分场景统计误差，保存csv文件，绘制水平误差图片
fp = fopen([filefolder 'result.csv'],'wt');
%打印头
head1 = ["scene","invalid",'length',"horizontal error(m)","vertical error(m)","roll error(deg)","pitch error(deg)","heading error(deg)"];
head2 = ["cep50","cep68","cep95","cep99"];
fprintf(fp,'%s,%s,',head1(1),head1(2));
for i = 3:7
    fprintf(fp,'%s,,,,',head1(i));
end
fprintf(fp,'\n');
fprintf(fp,',,,');
for i = 1:5
    for j =1:4
        fprintf(fp,'%s,',head2(j));
    end
end
fprintf(fp,'\n');
%分段打印
if N_nogps~=0
    for i=1:N_nogps
        n_temp=find( true_c(:,1)>t_nogps(i,1) & true_c(:,1)<t_nogps(i,2) );
        if isempty(n_temp)
            continue;
        else
%             sum_dift_error =[ sum_statistic(error_r(n_temp,1));sum_statistic(error_r(n_temp,2));sum_statistic(error_r(n_temp,3));...
%                 sum_statistic(error_v(n_temp,1));sum_statistic(error_v(n_temp,2));sum_statistic(error_v(n_temp,3));...
%                 sum_statistic(error_A(n_temp,1));sum_statistic(error_A(n_temp,2));sum_statistic(error_A(n_temp,3))]',
            
            lenth_cur =  sqrt(true_c(n_temp,5).^2 +true_c(n_temp,6).^2);
            len = mean(lenth_cur) * (t_nogps(i,2)-t_nogps(i,1));

            error_horizontal = sqrt(error_r(n_temp,1).^2 + error_r(n_temp,2).^2);
            error_vertical = abs(error_r(n_temp,3));
            error_roll = abs(error_A(n_temp,1));
            error_pitch = abs(error_A(n_temp,2));
            error_heading = abs(error_A(n_temp,3));
            
                        num=length(error_horizontal);

            %绘制水平误差曲线
            if i > 0
                fh = figure('Visible','on');
            else
                fh = figure('Visible','off');
            end
            plot(t_disp(n_temp),error_horizontal, '.-'),
            ylabel('Horizontal error (m)'), title(sys_name, 'Interpreter', 'None'), grid on;
            if t_shift==0
                xlabel(' Time (sec)');
            else
                xlabel(['Time -' int2str(t_shift) ' (sec)']);
            end
            legend(dsc_nogs(i));
            
            saveas(fh,[filefolder char(dsc_nogs(i))]);
            error_horizontal=sort(error_horizontal);
            error_vertical=sort(error_vertical);
            error_roll=sort(error_roll);
            error_pitch=sort(error_pitch);
            error_heading=sort(error_heading);
            rtk_err(i,:)=[error_horizontal(round(0.50*num)), error_horizontal(round(0.68*num)),error_horizontal(round(0.95*num)),error_horizontal(round(0.99*num))...
                ,error_vertical(round(0.50*num)), error_vertical(round(0.68*num)),error_vertical(round(0.95*num)),error_vertical(round(0.99*num))...
                ,error_roll(round(0.50*num)), error_roll(round(0.68*num)),error_roll(round(0.95*num)),error_roll(round(0.99*num))...
                ,error_pitch(round(0.50*num)), error_pitch(round(0.68*num)),error_pitch(round(0.95*num)),error_pitch(round(0.99*num))...
                ,error_heading(round(0.50*num)), error_heading(round(0.68*num)),error_heading(round(0.95*num)),error_heading(round(0.99*num))];
            
            
            fprintf(fp,'%s,',dsc_nogs(i));
            clear t_disp_e;
            t_disp_e = t_disp(n_temp);
            count = (num/((1/t_dt)*(t_disp_e(end)-t_disp_e(1)) + 1))*100;
            clear t_disp_e;
            
            fprintf(fp,'%10.4f,',count);
            fprintf(fp,'%10.4f,',len);
            for j =1:20
                if(j==20)
                    
                    fprintf(fp,'%.2f\n',rtk_err(i,j)); %换行
                    
                else
                    
                    fprintf(fp,'%.2f,',rtk_err(i,j)); %tab（多个空格）
                    
                end
            end
            
        end
        
        %     save(['error_drift_max' fname_sol '.txt'], 'temp', '-ascii', '-tabs');
        %  dlmwrite('error.txt',sum_dift_error,'-append');
    end
    
end
fclose(fp);





end