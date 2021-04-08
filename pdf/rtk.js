const fs = require('fs');

function gen_rtk_table(doc, csvFile) {
    const rtkCsvStr = fs.readFileSync(csvFile).toString();
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
            textAlign: 'center',
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
}

module.exports = {
    gen_rtk_table
};