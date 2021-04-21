const fs = require('fs');

function parse_csv_data(csvFile) {
  const rtkCsvStr = fs.readFileSync(csvFile).toString();
  const rtkCsvArr = rtkCsvStr.split('\n');

  let hpos = {};
  let vpos = {};
  let csvHeader = [];
  rtkCsvArr.forEach((item, i) => {
    const itemArr = item.split(',');
    itemArr.shift();
    if (i === 0) {
      itemArr.forEach((ele) => {
        csvHeader.push(ele.trim());
      });
    } else {
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
  });

  return {
    hpos,
    vpos
  }
}

function gen_rtk_table(doc, csvFile, benchmarkFile) {
  const curData = parse_csv_data(csvFile);
  let benchmarkData = null;
  if (benchmarkFile) {
    benchmarkData = parse_csv_data(benchmarkFile);
  }

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
    ['hpos', 'Horizontal-fixed', '50p-fix', '68p-fix', '95p-fix', '99p-fix', 'fix'],
    ['vpos', 'Vertical-fixed','50p-fix', '68p-fix', '95p-fix', '99p-fix', 'fix'],
    ['hpos', 'Horizontal-float', '50p-flt', '68p-flt', '95p-flt', '99p-flt', 'flt'],
    ['vpos', 'Vertical-float', '50p-flt', '68p-flt', '95p-flt', '99p-flt', 'flt'],
    ['hpos', 'Horizontal-all', '50p-all', '68p-all', '95p-all', '99p-all', 'all'],
    ['vpos', 'Vertical-all', '50p-all', '68p-all', '95p-all', '99p-all', 'all'],
  ];

  const defaultOption = {
    textAlign: 'center'
  };

  const passOption = {
    textAlign: 'center',
    color: '#008000'
  };

  const failOption = {
    textAlign: 'center',
    color: '#FF0000'
  };

  let rateOption = null;
  rows.forEach(item => {
    const row = table.row({
      lineHeight: 2,
    });
    let dataSrc = null;
    let benchmarkSrc = null;
    if (item[0] === 'hpos') {
      dataSrc = curData.hpos;
      benchmarkSrc = benchmarkData ? benchmarkData.hpos : null;
    } else {
      dataSrc = curData.vpos;
      benchmarkSrc = benchmarkData ? benchmarkData.vpos : null;
    }

    item.forEach((ele, i) => {
      if (i === 0) {
        return;
      }

      if (i === 1) {
        row.cell(ele, defaultOption);
        return;
      }

      let option = defaultOption;
      if (benchmarkSrc) {
        if (dataSrc[ele] > benchmarkSrc[ele]) {
          option = failOption;
        } else {
          option = passOption;
        }
      }
      if (i <= 5) {
        row.cell(dataSrc[ele], option);
        return;
      }

      option = defaultOption;
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

      if (benchmarkSrc) {
        if (!rateOption) {
          let benchmarkRate = 0;
          if (ele === 'fix') {
            benchmarkRate = benchmarkSrc['fix rate'];
            rateOption = rate >= benchmarkRate ? passOption : failOption;
          }
        }
      }
      row.cell(`${rate}`, rateOption ? rateOption : option);
    });
  });
}

module.exports = {
    gen_rtk_table
};