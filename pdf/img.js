
const fs = require('fs');
const pdf = require('pdfjs');

function gen_img(doc, imgFile, text) {
    const imgContent = fs.readFileSync(imgFile);
    const pdfImg = new pdf.Image(imgContent);
    doc.image(pdfImg, {
      width: doc.width * 0.8,
      align: 'center',
    });
    doc.text(text, {
      textAlign: 'center',
      fontSize: 14,
    });
}


module.exports = {
    gen_img
};