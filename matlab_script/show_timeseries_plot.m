function ret = show_timeseries_plot(sol_1, mod, filename)
    ret=1;
    figure
    if (mod==1)
     plot(sol_1(:,5:7),'.');
     hold on;
     set(gca,'FontWeight','bold','FontSize',12);
     ylim(gca, [-1 1]);
     xlabel(gca, 'Epoch')
     ylabel(gca, 'Position error (m)')
     legend('North','East','Up');
     box on;
     grid on;
    elseif (mod(2)==1)
      hor_err = sqrt(sol_1(:,5).^2+ sol_1(:,6).^2);
      ver_err = sol_1(:,7);
      plot(hor_err,'linewidth',1.5);
      hold on;
      plot(ver_err,'linewidth',1.5);
      hold on;
      set(gca,'FontWeight','bold','FontSize',12);
      xlabel(gca, 'Epoch')
      ylabel(gca, 'Position error (m)')
      legend('Horizontal','Vertical');
      box on;
      grid on;
    end 
    saveas(gcf,strcat(filename,'-ts.jpg'));              
    h=findall(0,'type','figure');
    delete(h);
    
end 