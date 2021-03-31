const pdf = require('pdfjs');
const fs = require('fs');
const path = require('path');

function gen_pdf(data_path,pdf_name,data_name){
  const output = fs.createWriteStream(path.join(data_path,pdf_name));
  const doc = new pdf.Document();
  // const footer = doc.footer();
  // footer.text('before', { textAlign: 'center' });
  // footer.pageNumber({ textAlign: 'center', fontSize: 16 });

  // const header = doc.header();
  // header.pageNumber({ textAlign: 'center', fontSize: 16 });
  // header.text('after', { textAlign: 'center' });

  const logo = fs.readFileSync(path.join(__dirname,'images/logo.jpg'));
  const logoPdf = new pdf.Image(logo);

  doc.image(logoPdf, {
    width: 64,
  });

  doc.text('OpenRTK330 Regression Report', {
    textAlign: 'center',
    lineHeight: 30,
    color: '#007f7b',
  });

  doc.text('2021-03-25', {
    textAlign: 'center',
    lineHeight: 20,
    color: '#007f7b',
  });
  doc.text('© Aceinna Inc, 2021', {
    textAlign: 'center',
    color: '#007f7b',
  });

  doc.pageBreak();
  doc.text('1.Performance requirements', {
    color: '#007f7b',
    destination: 'goTo-tag-1',
  });
  doc.text('Table 1. INS performance requirement from Inceptio', {
    textAlign: 'center',
    lineHeight: 5,
  });
  const table = doc.table({
    widths: ['*', '*'],
    borderWidth: 1,
  });
  const header = table.header({
    backgroundColor: '#007f7b',
    color: '#FFFFFF',
    lineHeight: 2,
  });
  header.cell('Scenario', { textAlign: 'center' });
  header.cell('Required Performance', { textAlign: 'center' });

  const row1 = table.row();
  row1.cell('GPS and RTK ready without blockage', { textAlign: 'center' });
  row1.cell('· Postion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dt\r\n· Heading change between 2 message < 110% real yaw rate * dtPostion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dtHeading change between 2 message < 110% real yaw rate * dt');

  const row2 = table.row();
  row2.cell('GPS blockage for at most 3 seconds', { textAlign: 'center' });
  row2.cell('· Postion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dt\r\n· Heading change between 2 message < 110% real yaw rate * dtPostion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dtHeading change between 2 message < 110% real yaw rate * dt');

  const row3 = table.row();
  row3.cell('In tunnel GPS and RTK losts', { textAlign: 'center' });
  row3.cell('· Postion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dt\r\n· Heading change between 2 message < 110% real yaw rate * dtPostion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dtHeading change between 2 message < 110% real yaw rate * dt');

  const row4 = table.row();
  row4.cell('Exit tunnel with GPS and RTK back (solution in recovering stage)', { textAlign: 'center' });
  row4.cell('· Postion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dt\r\n· Heading change between 2 message < 110% real yaw rate * dtPostion error < 10cm\r\n· Heading < 0.2 deg\r\n· Position change between 2 message < 110% real velocity * dtHeading change between 2 message < 110% real yaw rate * dt');

  doc.pageBreak();
  doc.text('2.Configuration', {
    color: '#007f7b',
  });

  const conf1ImgFile = fs.readFileSync(path.join(__dirname,'images/conf1.jpg'));
  const conf1Img = new pdf.Image(conf1ImgFile);
  doc.text('', {
    lineHeight: 1.5,
  });
  doc.image(conf1Img, {
    align: 'center',
  });
  doc.text('Figure 1 Diagram showing the components of Aceinna’s OpenRTK testing system', {
    textAlign: 'center',
  });
  doc.text('', {
    lineHeight: 1.5,
  });
  const conf2ImgFile = fs.readFileSync(path.join(__dirname,'images/conf2.jpg'));
  const conf2Img = new pdf.Image(conf2ImgFile);
  doc.image(conf2Img, {
    align: 'center',
  });
  doc.text('Figure 2 Block diagram of the test hardware conﬁguration', {
    textAlign: 'center',
  });

  doc.text('The test system consisted of hardware for capturing and logging raw GNSS observations from a variety of receivers, as well as capturing the output in real-time. The hardware was mounted in a stainless steel sheet. The hardware conﬁguration for the test is shown in Figure 2.');
  doc.text('The test hardware consisted of an active GNSS antenna connected to a 4-port passive Radio Frequency (RF) splitter that distributed the GNSS signal to various GNSS receivers. Internet connectivity was provided to the DELL Latitude 7400 laptop computer via a HUAWEI wireless router that used a CHINA UNICOM cellular modem. The WiFi router was connected to the laptop computer via an Ethernet cable.');
  doc.text('The test setup included two different GNSS receivers: an OpenRTK receiver and a Novatel SPAN CTP7 dual-frequency RTK receiver used as a truth reference. Power for the active antenna was passed through the RF splitter from the SPAN CTP7. A DELL Latitude 7400 laptop computer was used to log data from both receivers.');

  doc.pageBreak();
  doc.text('3.Dataset List', {
    color: '#007f7b',
  }).br().br();

  const dsTab = doc.table({
    widths: ['*', '*', '*', '*'],
    borderWidth: 1,
  });
  const dsHeader = dsTab.header({
    backgroundColor: '#007f7b',
    color: '#FFFFFF',
    lineHeight: 2,
  });
  dsHeader.cell('Data', { textAlign: 'center' });
  dsHeader.cell('Location', { textAlign: 'center' });
  dsHeader.cell('Duration', { textAlign: 'center' });
  dsHeader.cell('Correction', { textAlign: 'center' });

  const dsList = [
    {
      data: 'rover_2021_02_28_10_42_57', location: 'Wuxi', duration: '1 hr 40 min', correction: 'Aceinna',
    },
    {
      data: 'rover_2021_02_28_10_42_57', location: 'Wuxi', duration: '1 hr 40 min', correction: 'Sixents',
    },
    {
      data: 'rover_2021_02_28_10_42_57', location: 'Wuxi', duration: '1 hr 40 min', correction: 'Aceinna',
    },
    {
      data: 'rover_2021_02_28_10_42_57', location: 'Wuxi', duration: '1 hr 40 min', correction: 'Aceinna',
    },
  ];

  dsList.forEach((item) => {
    const dsRow = dsTab.row();
    dsRow.cell(item.data, { textAlign: 'center' });
    dsRow.cell(item.location, { textAlign: 'center' });
    dsRow.cell(item.duration, { textAlign: 'center' });
    dsRow.cell(item.correction, { textAlign: 'center' });
  });


  doc.pageBreak();
  doc.text('4.RTK/INS Results', {
    color: '#007f7b',
  }).br().br();

  doc.text('4.1 Case 1: Highway and typical urban street', {
    color: '#007f7b',
  }).br();
  doc.text('The test scenario considered was a 150km route on the highway/urban roads between Wuxi and Suzzhou, China. The route is shown in Figure 3. The route started near the Aceinna’s wuxi office and proceeded southeast to Suzhou. Most of this route offered highway and typical urban street. The data was collected using an Aviation Antenna HX-CAX601A, mounted to the roof of the vehicle. The true trajectory of the route was established using the Novatel SPAN CTP7 receiver with Sixents Locate-CM service.');

  const kmlFile = fs.readFileSync(path.join(__dirname,'images/kml.jpg'));
  const kmlImg = new pdf.Image(kmlFile);
  doc.image(kmlImg, {
    width: doc.width * 0.8,
    align: 'center',
  });

  doc.text('Figure 3 Map showing the route of the drive test around Wuxi and Suzhou, China', {
    textAlign: 'center',
    fontSize: 14,
  });

  doc.text('4.1.1 RTK results', {
    color: '#007f7b',
    lineHeight: 4,
  });

  doc.text('Case 1 RTK result demonstrated true centimeter-level horizontal positioning in fixed mode. with the 99th percentile horizontal position error in all mode is less than 1.2m.');

  doc.pageBreak();

  const tsFile = fs.readFileSync(path.join(data_path,data_name+"-ts.jpg"));
  const tsImg = new pdf.Image(tsFile);
  doc.image(tsImg, {
    width: doc.width * 0.8,
    align: 'center',
  });

  doc.text('Figure 4 Time series of north, east and up position errors in case 1.', {
    textAlign: 'center',
    fontSize: 14,
  });

  doc.text('', {
    lineHeight: 1.5,
  });

  const cdfFile = fs.readFileSync(path.join(data_path,data_name+"-cdf.jpg"));
  const cdfImg = new pdf.Image(cdfFile);
  doc.image(cdfImg, {
    width: doc.width * 0.8,
    align: 'center',
  });

  doc.text('Figure 5 Cumulative distribution function of RTK horizontal position errors in case 1.', {
    textAlign: 'center',
    fontSize: 14,
  });

  doc.pageBreak();

  const cepFile = fs.readFileSync(path.join(data_path,data_name+"-cep.jpg"));
  const cepImg = new pdf.Image(cepFile);
  doc.image(cepImg, {
    width: doc.width * 0.8,
    align: 'center',
  });

  doc.text('Figure 6 statistic bar of RTK horizontal position errors in the driving test scenario.', {
    textAlign: 'center',
    fontSize: 14,
  });

  doc.pageBreak();

  doc.text('4.1.2 INS results', {
    color: '#007f7b',
    lineHeight: 4,
  });

  doc.pageBreak();


  doc.pipe(output);
  doc.end();
}

module.exports = {
  gen_pdf
}