const pdf = require('html-pdf'); // html-pdf

exports.createPDFProtocolFile = function (template, options, reg, filename) {
    /**
      template: html 模板
      options: 配置
      reg: 正则匹配规则
      filename: 输出pdf文件路径及文件名
    */
    // 将所有匹配规则在html模板中匹配一遍
    if (reg && Array.isArray(reg)) {
    reg.forEach(item => {
        template = template.replace(item.relus, item.match);
    });
    }
    pdf.create(template, options).toFile(filename, function(err, res) {
        if (err) {
            return console.log(err);
        }
        console.log(res);
    });
  }