function ret = show_cep_plot(hor_err,ver_err, mod, filename)
    ret=1;
    
    rtk_err=[hor_err; ver_err];
    figure
    if (mod(1)==1)
%        rtk_err=[hor_50p_all,hor_68p_all,hor_95p_all,hor_99p_all];
       bc=bar(rtk_err(1,:)');
       set(bc,'facecolor',[0 0.5 0]);
       set(gca,'FontWeight','bold','FontSize',11);
       set(gca,'xticklabel',{'CEP50','CEP68','CEP95','CEP99'});
       ylim(gca, [0 5]);
       set(gca,'FontWeight','bold','FontSize',11);
       ylabel(gca, 'Horizontal error (m)')
       for i=1:4
         text(i-0.25,min(rtk_err(1,i),4.5),num2str(rtk_err(1,i),'%.2f'),...
         'FontWeight','bold','HorizontalAlignment','center',...
         'VerticalAlignment','bottom')
       end 
       box on;
    elseif (mod(2)==1)
%        rtk_err=[hor_50p_all,hor_68p_all,hor_95p_all,hor_99p_all];
       bc=bar(rtk_err(2,:)');
       set(bc,'facecolor',[0 0.5 0]);
       set(gca,'FontWeight','bold','FontSize',11);
       set(gca,'xticklabel',{'','CEP50','CEP68','CEP95','CEP99',''});
       ylim(gca, [0 5]);
       set(gca,'FontWeight','bold','FontSize',11);
       ylabel(gca, 'Horizontal error (m)')
       for i=1:4
         text(i-0.25,min(rtk_err(2,i),4.5),num2str(rtk_err(2,i),'%.2f'),...
         'FontWeight','bold','HorizontalAlignment','center',...
         'VerticalAlignment','bottom')
       end 
       box on;
    elseif (sum(mod)==2)    
%        rtk_err=[hor_50p_all,hor_68p_all,hor_95p_all,hor_99p_all];
       set(gca,'xticklabel',{'','CEP50','CEP68','CEP95','CEP99',''});
       ylim(gca, [0 5]);
       set(gca,'FontWeight','bold','FontSize',11);
       ylabel(gca, 'Horizontal error (m)')
       bc=bar(rtk_err');
       set(bc,'facecolor',[0 0.5 0]);
       set(gca,'FontWeight','bold','FontSize',11);
       
       
       for i=1:4
         text(i-0.25,min(rtk_err(1,i),4.5),num2str(rtk_err(1,i),'%.2f'),...
         'FontWeight','bold','HorizontalAlignment','center',...
         'VerticalAlignment','bottom')
       end 
       
       for i=1:4
         text(i,min(rtk_err(2,i),4.5),num2str(rtk_err(2,i),'%.2f'),...
         'FontWeight','bold','HorizontalAlignment','center',...
         'VerticalAlignment','bottom')
       end 
       box on;
    end 
    
    box on;
    grid on;
    saveas(gcf,strcat(filename,'-cep.jpg'));              
    h=findall(0,'type','figure');
    delete(h);
    
end 