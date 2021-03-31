function ret = show_cdf_plot(hor_err,ver_err, mod, filename)
    ret=1;
   
    figure
    if (mod(1)==1)
      cdfplot(hor_err);
      hold on
      set(gca,'FontWeight','bold','FontSize',12);
      xlim(gca, [0 2]);
      xlabel(gca, 'Horizontal error (m)')
      ylabel(gca, 'CDF')
      title('OpenRTK330LI Position CDF ');
    elseif (mod(2)==1)
      cdfplot(ver_err);
      hold on
      set(gca,'FontWeight','bold','FontSize',12);
      xlim(gca, [0 2]);
      xlabel(gca, 'Vertical error (m)')
      ylabel(gca, 'CDF')
      title('OpenRTK330LI CDF ');
    elseif (sum(mod)==2)    
      cdfplot1(hor_err);
      hold on
      cdfplot2(ver_err);
      hold on
      set(gca,'FontWeight','bold','FontSize',12);
      xlim(gca, [0 2]);
      xlabel(gca, 'Position error (m)')
      ylabel(gca, 'CDF')
      title('OpenRTK330LI Position CDF ');
      legend('Horizontal','Vertical');
    end 
    
    box on;
    grid on;
    saveas(gcf,strcat(filename,'-cdf.jpg'));              
    h=findall(0,'type','figure');
    delete(h);
    
end 