const pdf = require('pdfjs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const {
  gen_ins_table
} = require('./ins');

const {
  gen_img
} = require('./img');

function gen_single_pdf(output_path, pdf_name, data_name){
  const output = fs.createWriteStream(path.join(output_path, pdf_name));
  const doc = new pdf.Document();

  const pdfHeader = doc.table({
    widths: ['*', '*'],
    paddingBottom: 1 * pdf.cm
  }).row();

  const logo = fs.readFileSync(path.join(__dirname,'images/logo.jpg'));
  const logoPdf = new pdf.Image(logo);
  pdfHeader.cell().image(logoPdf, {
    height: 50
  });

  const openrtkFile = fs.readFileSync(path.join(__dirname,'images/openrtk.jpg'));
  const openrtkImg = new pdf.Image(openrtkFile);
  pdfHeader.cell().image(openrtkImg, {
    height: 50,
    align: 'right',
  });

  doc.text('1. Report time', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5,
  });
  const curTime = Date.now();
  doc.text(`     ${moment(curTime).format('YYYY-MM-DD')}`);

  doc.text('2. Dataset', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5,
  });
  doc.text(`     ${data_name}`);

  doc.text('3. RTK result', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5
  });

  const rtkCsvFile = path.join(output_path, 'rtk_statistic.txt');
  const rtkCsvStr = fs.readFileSync(rtkCsvFile).toString();
  const rtkCsvArr = rtkCsvStr.split('\n');
  let csvHeader = [];
  let hpos = {};
  let vpos = {};
  rtkCsvArr.forEach((item, i) => {
    const itemArr = item.split(',');
    const itemFile = itemArr.shift();
    if (i === 0) {
      itemArr.forEach((ele) => {
        csvHeader.push(ele.trim());
      });
    } else {
      if (itemFile.endsWith(data_name)) {
        const pos = {};
        itemArr.forEach((ele, i) => {
          pos[csvHeader[i]] = ele.trim();
        });
        if (itemArr[0] === 'hpos') {
          hpos = pos;
        }
        if (itemArr[0] === 'vpos') {
          vpos = pos;
        }
      }
    }
  });

  const headerArr = ['Type', 'CEP50', 'CEP68', 'CEP95', 'CEP99', 'Rate(%)'];
  const table = doc.table({
    widths: new Array(headerArr.length).fill('*'),
    borderWidth: 1,
  });

  const header = table.header({
    backgroundColor: '#007f7b',
    color: '#FFFFFF',
    lineHeight: 2,
  });
  
  headerArr.forEach(item => {
    header.cell(item, { textAlign: 'center' });
  });

  const rows = [
    ['hpos', 'Horizonal-fixed', '50p-fix', '68p-fix', '95p-fix', '99p-fix', 'fix'],
    ['vpos', 'Vertical-fixed','50p-fix', '68p-fix', '95p-fix', '99p-fix', 'fix'],
    ['hpos', 'Horizonal-float', '50p-flt', '68p-flt', '95p-flt', '99p-flt', 'flt'],
    ['vpos', 'Vertical-float', '50p-flt', '68p-flt', '95p-flt', '99p-flt', 'flt'],
    ['hpos', 'Horizonal-all', '50p-all', '68p-all', '95p-all', '99p-all', 'all'],
    ['vpos', 'Vertical-all', '50p-all', '68p-all', '95p-all', '99p-all', 'all'],
  ];
  rows.forEach(item => {
    const row = table.row({
      lineHeight: 2,
    });
    const dataSrc = item[0] === 'hpos' ? hpos : vpos;
    item.forEach((ele, i) => {
      if (i === 0) {
       return;
      }

      if (i === 1) {
        row.cell(ele, {
          textAlign: 'center'
        });
        return;
      }

      if (i <= 5) {
        row.cell(dataSrc[ele], {
          textAlign: 'center'
        });
        return;
      }

      let rate = 0;
      if (ele === 'fix') {
        rate = dataSrc['fix rate'];
      }
      if (ele === 'flt') {
        rate = (100 - dataSrc['fix rate']).toFixed(2);
      }
      if (ele === 'all') {
        rate = 100;
      }
      row.cell(`${rate}`, {
        textAlign: 'center'
      });
    });
  });

  doc.text('  \r\n', {
    lineHeight: 1
  }).br();

  gen_img(doc, path.join(output_path, "kml.jpg"), 'Map showing the route of the drive test');

  doc.pageBreak();

  gen_img(doc, path.join(output_path,data_name+"-ts.jpg"), 'Time series of north, east and up position errors');

  gen_img(doc, path.join(output_path,data_name+"-cdf.jpg"), 'Cumulative distribution function of RTK horizontal position errors');


  doc.pageBreak();

  gen_img(doc, path.join(output_path,data_name+"-cep.jpg"), 'Statistic bar of RTK horizontal position errors in the driving test scenario');

  doc.text('4. INS result', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5
  });


  const insDir = path.join(output_path, 'ins');
  const insCsvFile = path.join(insDir, 'result.csv');
  const insCsvStr = fs.readFileSync(insCsvFile).toString();
  const insCsvArr = insCsvStr.split('\n');

  const insDataArr = insCsvArr.slice(2);
  const insAllData = insDataArr.shift();
  gen_ins_table(doc, insAllData);


  doc.pageBreak();

  gen_img(doc, path.join(insDir, 'Errorcurve.jpg'), 'Time series of position error, velocity error, attitude error');

  gen_img(doc, path.join(insDir, 'Whole dataset.jpg'), 'Time series of horizontal error of all data');


  doc.pageBreak();

  gen_img(doc, path.join(insDir, 'trajectory.jpg'), 'Trajectory of the drive test');


  insDataArr.forEach((item, i)=> {
    if (item.length === 0) {
      return;
    }

    const caseName = item.split(',')[0];
    doc.text(`4.${i+1} Case ${i+1}: ${caseName}`, {
      color: '#007f7b',
      fontSize: 14,
      lineHeight: 2.5
    });
    gen_ins_table(doc, item);

    doc.pageBreak();
    
    const interruptFile = fs.readFileSync(path.join(insDir, `${caseName}.jpg`));
    const interruptImg = new pdf.Image(interruptFile);
    doc.image(interruptImg, {
      width: doc.width * 0.8,
      align: 'center',
    });
    doc.text(`Time series of horizontal error of ${caseName}`, {
      textAlign: 'center',
      fontSize: 14,
    });
  });

  doc.pipe(output);
  doc.end();
}


function gen_full_pdf(data_path, pdf_name){
  
  const output = fs.createWriteStream(path.join(data_path,pdf_name));
  const doc = new pdf.Document();

  const pdfHeader = doc.table({
    widths: ['*', '*'],
    paddingBottom: 1 * pdf.cm
  }).row();

  const logo = fs.readFileSync(path.join(__dirname,'images/logo.jpg'));
  const logoPdf = new pdf.Image(logo);
  pdfHeader.cell().image(logoPdf, {
    height: 50
  });

  const openrtkFile = fs.readFileSync(path.join(__dirname,'images/openrtk.jpg'));
  const openrtkImg = new pdf.Image(openrtkFile);
  pdfHeader.cell().image(openrtkImg, {
    height: 50,
    align: 'right',
  });

  doc.text('OpenRTK330 Regression Report', {
    textAlign: 'center',
    lineHeight: 10,
    fontSize: 24,
    color: '#007f7b',
  });

  const curTime = Date.now();
  doc.text(`${moment(curTime).format('YYYY-MM-DD')}`, {
    textAlign: 'center',
    lineHeight: 20,
    color: '#007f7b',
  });
  doc.text(`© Aceinna Inc, ${moment(curTime).format('YYYY')}`, {
    textAlign: 'center',
    color: '#007f7b',
  });

  doc.pageBreak();
  doc.text('1. Performance requirements', {
    color: '#007f7b',
    fontSize: 16,
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
    lineHeight: 1.8,
  });
  header.cell('Scenario', { textAlign: 'center', fontSize: 15, });
  header.cell('Required Performance', { textAlign: 'center', fontSize: 15 });

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

  // const tsFile = fs.readFileSync(path.join(data_path,data_name+"-ts.jpg"));
  // const tsImg = new pdf.Image(tsFile);
  // doc.image(tsImg, {
  //   width: doc.width * 0.8,
  //   align: 'center',
  // });

  // doc.text('Figure 4 Time series of north, east and up position errors in case 1.', {
  //   textAlign: 'center',
  //   fontSize: 14,
  // });

  // doc.text('', {
  //   lineHeight: 1.5,
  // });

  // const cdfFile = fs.readFileSync(path.join(data_path,data_name+"-cdf.jpg"));
  // const cdfImg = new pdf.Image(cdfFile);
  // doc.image(cdfImg, {
  //   width: doc.width * 0.8,
  //   align: 'center',
  // });

  // doc.text('Figure 5 Cumulative distribution function of RTK horizontal position errors in case 1.', {
  //   textAlign: 'center',
  //   fontSize: 14,
  // });

  // doc.pageBreak();

  // const cepFile = fs.readFileSync(path.join(data_path,data_name+"-cep.jpg"));
  // const cepImg = new pdf.Image(cepFile);
  // doc.image(cepImg, {
  //   width: doc.width * 0.8,
  //   align: 'center',
  // });

  // doc.text('Figure 6 statistic bar of RTK horizontal position errors in the driving test scenario.', {
  //   textAlign: 'center',
  //   fontSize: 14,
  // });

  // doc.pageBreak();

  doc.text('4.1.2 INS results', {
    color: '#007f7b',
    lineHeight: 4,
  });

  doc.pageBreak();


  doc.pipe(output);
  doc.end();
}

module.exports = {
  gen_single_pdf,
  gen_full_pdf
}