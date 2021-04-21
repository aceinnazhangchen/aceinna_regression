const pdf = require('pdfjs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const xlsx = require('node-xlsx');

const {
  gen_ins_table,
  gen_inceptio_requirement,
  gen_inceptio_table,
  gen_inceptio_allTable
} = require('./ins');

const {
  gen_img
} = require('./img');

const {
  gen_rtk_table
} = require('./rtk');

function gen_single_pdf(resultDir, curVer, benchmarkVer, dataset, dataName){
  const curVerDir = path.join(resultDir, curVer, dataset);
  let benchmarkVerDir = '';
  if (benchmarkVer !== '' && benchmarkVer !== curVer) {
    benchmarkVerDir = path.join(resultDir, benchmarkVer, dataset);
  }
  const output = fs.createWriteStream(path.join(curVerDir, dataName + '.pdf'));
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
  doc.text(`     ${dataName}`);

  doc.text('3. Version', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5,
  });
  doc.text(`     Current: ${curVer}`);
  if (benchmarkVer !== '' && benchmarkVer !== curVer) {
    doc.text(`     Benchmark: ${benchmarkVer}`);
  }

  doc.text('4. Requirement', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5
  });

  doc.text('In order to meet the requirements of different customers, Aceinna added a requirements assessment to the Aceinna Regression-test. Customers can send test data in a fixed format and requirements to Aceinna, and Aceinna will return a pass or fail result according to different customer requirements.', {
    lineHeight: 1.8,
  });

  doc.text('4.1. Inceptio Requirement', {
    color: '#007f7b',
    fontSize: 12,
    lineHeight: 2
  });

  gen_inceptio_requirement(doc);

  doc.pageBreak();

  doc.text('4.2. Inceptio requirement assessment', {
    color: '#007f7b',
    fontSize: 12,
    lineHeight: 2
  });
  const insDir = path.join(curVerDir, 'ins');
  const insCsvFile = path.join(insDir, 'result.csv');
  gen_inceptio_table(doc, insCsvFile);

  doc.pageBreak();
  doc.text('5. RTK result', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5
  });

  const rtkStatisticFile = 'rtk_statistic.txt';
  let benchmarkFile = '';
  if (benchmarkVerDir !== '') {
    benchmarkFile = path.join(benchmarkVerDir, rtkStatisticFile);
  }
  gen_rtk_table(doc, path.join(curVerDir, rtkStatisticFile), benchmarkFile);

  doc.text('  \r\n', {
    lineHeight: 1
  }).br();

  gen_img(doc, path.join(curVerDir, "kml.jpg"), 'Map showing the route of the drive test');

  doc.pageBreak();

  gen_img(doc, path.join(curVerDir, dataName+".csv-ts.jpg"), 'Time series of north, east and up position errors');

  gen_img(doc, path.join(curVerDir, dataName+".csv-cdf.jpg"), 'Cumulative distribution function of RTK horizontal position errors');


  doc.pageBreak();

  gen_img(doc, path.join(curVerDir, dataName+".csv-cep.jpg"), 'Statistic bar of RTK horizontal position errors in the driving test scenario');

  doc.text('6. INS result', {
    color: '#007f7b',
    fontSize: 14,
    lineHeight: 2.5
  });


  const insCsvStr = fs.readFileSync(insCsvFile).toString();
  const insCsvArr = insCsvStr.split('\n');
  let benchmarkInsCsvArr = [];
  if (benchmarkVerDir) {
    const benchmarkInsDir = path.join(benchmarkVerDir, 'ins');
    const benchmarkInsCsvFile = path.join(benchmarkInsDir, 'result.csv');
    const benchmarkInsCsvStr = fs.readFileSync(benchmarkInsCsvFile).toString();
    benchmarkInsCsvArr = benchmarkInsCsvStr.split('\n');
  }

  const insDataArr = insCsvArr.slice(2);
  const insAllData = insDataArr.shift();
  const benchmarkInsDataArr = benchmarkInsCsvArr.slice(2);
  const benchmarkAllData = benchmarkInsDataArr.shift();
  gen_ins_table(doc, insAllData, benchmarkAllData);


  doc.pageBreak();

  gen_img(doc, path.join(insDir, 'Errorcurve.jpg'), 'Time series of position error, velocity error, attitude error');

  gen_img(doc, path.join(insDir, 'Whole dataset.jpg'), 'Time series of horizontal error of all data');


  doc.pageBreak();

  gen_img(doc, path.join(insDir, 'trajectory.jpg'), 'Trajectory of the drive test');


  let cIdx = 0;
  insDataArr.forEach((item, i)=> {
    if (item.length === 0) {
      return;
    }

    const itemArr = item.split(',');
    const scenrio = parseInt(itemArr[1]);
    if (!(scenrio === 0 || scenrio === 1)) {
      return;
    }
    const caseName = itemArr[0];

    cIdx++;
    doc.text(`6.${cIdx} Case ${cIdx}: ${caseName}`, {
      color: '#007f7b',
      fontSize: 14,
      lineHeight: 2.5
    });
    gen_ins_table(doc, item, benchmarkInsDataArr[i] || '');

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


function gen_full_pdf(resultDir, curVer, benchmarkVer, pdf_name) {
  const data_path = path.join(resultDir, curVer);
  const output = fs.createWriteStream(path.join(data_path, pdf_name));
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
  doc.text(`Version: ${curVer}`, {
    textAlign: 'center',
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
  gen_inceptio_requirement(doc);

  doc.pageBreak();
  doc.text('2.Configuration', {
    color: '#007f7b',
    fontSize: 16,
  }).br();

  gen_img(doc, path.join(__dirname,'images/conf1.jpg'), 'Figure 1 Diagram showing the components of Aceinna’s OpenRTK testing system');


  doc.text('  \r\n  ', {
    lineHeight: 1.5,
  });

  gen_img(doc, path.join(__dirname,'images/conf2.jpg'), 'Figure 2 Block diagram of the test hardware conﬁguration');

  doc.text('The test system consisted of hardware for capturing and logging raw GNSS observations from a variety of receivers, as well as capturing the output in real-time. The hardware was mounted in a stainless steel sheet. The hardware conﬁguration for the test is shown in ', {
    lineHeight: 1.8
  }).add('Figure 2', {
    fontSize: 14
  }).add('.');

  doc.text('The test hardware consisted of an active GNSS antenna connected to a 4-port passive Radio Frequency (RF) splitter that distributed the GNSS signal to various GNSS receivers. Internet connectivity was provided to the DELL Latitude 7400 laptop computer via a HUAWEI wireless router that used a CHINA UNICOM cellular modem. The WiFi router was connected to the laptop computer via an Ethernet cable.', {
    lineHeight: 1.8
  });
  doc.text('The test setup included two different GNSS receivers: an OpenRTK receiver and a Novatel SPAN CTP7 dual-frequency RTK receiver used as a truth reference. Power for the active antenna was passed through the RF splitter from the SPAN CTP7. A DELL Latitude 7400 laptop computer was used to log data from both receivers.', {
    lineHeight: 1.8
  }).br();

  doc.text('3.Dataset List', {
    color: '#007f7b',
    fontSize: 16,
  }).br();

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

  const dsList = [];
  const dataDirs = fs.readdirSync(data_path);
  dataDirs.forEach(item => {
    const itemDir = path.join(data_path, item);
    const itemStat = fs.statSync(itemDir);
    if (!itemStat.isDirectory()) {
      return;
    }
    const execlFile = path.join(itemDir, 'openrtk.xlsx');
    const exists = fs.existsSync(execlFile);
    if (!exists) {
      return;
    }
    const workSheetsFromFile = xlsx.parse(execlFile);
    const info = workSheetsFromFile[0].data[2];

    dsList.push({
      data: info[0],
      location: info[1],
      duration: info[2],
      correction: info[3]
    });
  });


  dsList.forEach((item) => {
    const dsRow = dsTab.row();
    dsRow.cell(item.data, { textAlign: 'center', padding: 10 });
    dsRow.cell(item.location, { textAlign: 'center', padding: 10 });
    dsRow.cell(item.duration, { textAlign: 'center', padding: 10 });
    dsRow.cell(item.correction, { textAlign: 'center', padding: 10 });
  });


  doc.pageBreak();
  doc.text('4.RTK/INS Results', {
    color: '#007f7b',
    fontSize: 16,
  }).br();

  doc.text('4.1 Inceptio requirement assessment', {
    color: '#007f7b',
    fontSize: 14,
  }).br();
  gen_inceptio_allTable(doc);

  doc.pageBreak();
  doc.text('4.2 RTK results', {
    color: '#007f7b',
    fontSize: 14,
  }).br();

  if (benchmarkVer !== '' && benchmarkVer !== curVer) {
    gen_rtk_table(doc, path.join(data_path, 'all_statistics.csv'), path.join(resultDir, benchmarkVer, 'all_statistics.csv'));
  } else {
    gen_rtk_table(doc, path.join(data_path, 'all_statistics.csv'), '');
  }
  

  doc.text('  \r\n', {
    lineHeight: 1
  }).br();

  gen_img(doc, path.join(data_path, 'all_res-cdf.jpg'), 'Cumulative distribution function of RTK horizontal position errors');
  doc.pageBreak();
  gen_img(doc, path.join(data_path, 'all_res-cep.jpg'), 'Statistic bar of RTK horizontal position errors in the driving test scenario');

  doc.text('4.3 INS results', {
    color: '#007f7b',
    fontSize: 14,
  }).br();

  const insCsvFile = path.join(data_path, 'all_ins_average.csv');
  const insCsvStr = fs.readFileSync(insCsvFile).toString();
  const insCsvArr = insCsvStr.split('\n');

  const insDataArr = insCsvArr.slice(2);
  const insAllData = insDataArr.shift();

  if (benchmarkVer !== '' && benchmarkVer !== curVer) {
    const benchmarkInsCsvFile = path.join(resultDir, benchmarkVer, 'all_ins_average.csv');
    const benchmarkInsCsvStr = fs.readFileSync(benchmarkInsCsvFile).toString();
    const benchmarkInsCsvArr = benchmarkInsCsvStr.split('\n');
  
    const benchmarkInsDataArr = benchmarkInsCsvArr.slice(2);
    const benchmarkInsAllData = benchmarkInsDataArr.shift();

    gen_ins_table(doc, insAllData, benchmarkInsAllData);
  } else {
    gen_ins_table(doc, insAllData, '');
  }

  doc.pipe(output);
  doc.end();
}

module.exports = {
  gen_single_pdf,
  gen_full_pdf
}