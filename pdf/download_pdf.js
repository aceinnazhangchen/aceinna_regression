var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');

// URL 使用URL生成对应的PDF
wkhtmltopdf('http://localhost:9690/report', { pageSize: 'letter' })
  .pipe(fs.createWriteStream('report.pdf'));