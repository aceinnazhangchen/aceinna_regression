function ret = show_csv_timeseries_plot(pos_err, mod, filename)
    ret=1;
    figure
    if (mod==1)
     plot(pos_err,'.');
     hold on;
     set(gca,'FontWeight','bold','FontSize',12);
     ylim(gca, [-1 1]);
     xlabel(gca, 'Epoch')
     ylabel(gca, 'Position error (m)')
     legend('North','East','Up');
     box on;
     grid on;
    elseif (mod(2)==1)
      hor_err = sqrt(pos_err(:,1).^2+ pos_err(:,2).^2);
      ver_err = pos_err(:,3);
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