

function gen_ins_table(doc, rowData) {
    const insHeaderArr = ['Type', 'CEP50', 'CEP68', 'CEP95', 'CEP99'];
    const insTab = doc.table({
      widths: new Array(insHeaderArr.length).fill('*'),
      borderWidth: 1,
    });
  
    const insHeader = insTab.header({
      backgroundColor: '#007f7b',
      color: '#FFFFFF',
      lineHeight: 2,
    });
    
    insHeaderArr.forEach(item => {
      insHeader.cell(item, { textAlign: 'center' });
    });

    const insRows = [
        ['Horizontal error(m)', '3', '4', '5', '6'],
        ['Vertical error(m)', '7', '8', '9', '10'],
        ['Horizontal v error(m)', '11', '12', '13', '14'],
        ['Vertical v error(m)', '15', '16', '17', '18'],
        ['Roll error(deg)', '19', '20', '21', '22'],
        ['Pitch error(deg)', '23', '24', '25', '26'],
        ['Heading error(deg)', '27', '28', '29', '30'],
        ['Longtitudinal error(m)', '31', '32', '33', '34'],
        ['Cross error(m)', '35', '36', '37', '38']
    ];

    const insDataArr = rowData.trim().split(',');

    insRows.forEach(item => {
        const row = insTab.row({
            lineHeight: 2
        });
        item.forEach((ele, i) => {
            if (i === 0) {
            row.cell(ele, {
                textAlign: 'center',
            });
            return;
            }

            row.cell(insDataArr[ele], {
            textAlign: 'center',
            });
        });
    });
}

module.exports = {
    gen_ins_table
};