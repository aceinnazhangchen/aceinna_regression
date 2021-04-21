const xlsx = require('node-xlsx');
const _ = require('underscore');

const insResults = {};

function gen_ins_table(doc, rowData, benchmarkData) {
    benchmarkData = benchmarkData || '';
    let isBenchmark = false;
    if (benchmarkData.length > 0) {
        isBenchmark = true;
    }
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
        ['Horizontal error(m)', '4', '5', '6', '7'],
        ['Vertical error(m)', '8', '9', '10', '11'],
        ['Horizontal v error(m)', '12', '13', '14', '15'],
        ['Vertical v error(m)', '16', '17', '18', '19'],
        ['Roll error(deg)', '20', '21', '22', '23'],
        ['Pitch error(deg)', '24', '25', '26', '27'],
        ['Heading error(deg)', '28', '29', '30', '31'],
        ['Longtitudinal error(m)', '32', '33', '34', '35'],
        ['Cross error(m)', '36', '37', '38', '39']
    ];

    const insDataArr = rowData.trim().split(',');
    const benchmarkDataArr = benchmarkData.trim().split(',');
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

    insRows.forEach(item => {
        const row = insTab.row({
            lineHeight: 2
        });
        item.forEach((ele, i) => {
            if (i === 0) {
                row.cell(ele, defaultOption);
                return;
            }

            let option = defaultOption;
            if (isBenchmark) {
                if (benchmarkDataArr[ele] >= insDataArr[ele]) {
                    option = passOption;
                } else {
                    option = failOption;
                }
            }
            row.cell(insDataArr[ele], option);
        });
    });
}

function gen_inceptio_requirement(doc) {
    const inceptioTable = doc.table({
        widths: ['*', '*'],
        borderWidth: 1,
    });
    const inceptioHeader = inceptioTable.header({
        backgroundColor: '#007f7b',
        color: '#FFFFFF',
        lineHeight: 2,
    });
    const inceptioHeaderArr = ['Scenario', 'Requirement Performance'];

    inceptioHeaderArr.forEach(item => {
        inceptioHeader.cell(item, { textAlign: 'center' });
    });

    const inceptioRows = [
        ['GPS and RTK ready without blockage', '· Position error < 10 cm\r\n· Heading < 0.2 deg'],
        ['GPS blockage for at most 3 seconds', '· Position error < 10 cm\r\n· Heading < 0.2 deg'],
        ['In tunnel GPS and RTK lost', '· Lateral Position error < 0.5% of the total distance travelled \r\n· Longitudinal Position error < 2% of the total distance travelled\r\n· Heading 0.5 deg'],
        ['Exit tunnel with GPS and RTK back (solution in recovering stage)', '· Position error recovering to < 30 cm in 3 seconds\r\n· Heading error recovering to < 0.6 deg in 3 seconds']
    ];
    inceptioRows.forEach((item, i) => {
        const row = inceptioTable.row({
            lineHeight: 2
        });
        let paddingTop = 20;
        if (i === 2) {
            paddingTop = 55;
        }
        if (i === 3) {
            paddingTop = 10;
        }
        row.cell(item[0], {
            paddingTop,
            paddingLeft: 10
        });
        row.cell(item[1], {
            padding: 10
        });
    });
}

function store_ins_result(idx, result) {
    result = result > 0 ? 1 : 0;
    if (_.has(insResults, idx)) {
        result = insResults[idx] & result;
    }
    insResults[idx] = result;
}


function gen_inceptio_table(doc, resultFile) {
    const table = doc.table({
        widths: ['*', '*', '*', '*'],
        borderWidth: 1,
    });

    const headerArr = ['Scenario', 'Requirement', 'Result', 'Pass/fail'];
  
    const header = table.header({
      backgroundColor: '#007f7b',
      color: '#FFFFFF',
      lineHeight: 2,
    });

    headerArr.forEach(item => {
        header.cell(item, { textAlign: 'center' });
    });

    const workSheetsFromFile = xlsx.parse(resultFile);
    const resultData = workSheetsFromFile[0].data;
    resultData.splice(0, 2);

    const resultMap = {};
    resultData.forEach(item => {
        const scenario = item[1];
        if (!resultMap[scenario]) {
            resultMap[scenario] = [];
        }
        if (scenario !== 4) {
            resultMap[scenario] = item;
        } else {
            resultMap[scenario].push(item);
        }
    });

    const passCfg = {
        textAlign: 'center',
        padding: 10,
        color: '#008000'
    };

    const failCfg = {
        textAlign: 'center',
        padding: 10,
        color: '#FF0000'
    };

    const actualCfg = {
        padding: 10,
        textAlign: 'center'
    };

    let result = 0;

    if (resultMap[2]) {
        const positionRow = table.row();
        positionRow.cell('GPS and RTK ready without blockage', {
            padding: 10,
        });
        positionRow.cell('Position error < 10 cm', {
            padding: 10
        });
        const val = resultMap[2];
        let actualVal = Math.sqrt(Math.pow(val[5], 2) + Math.pow(val[9], 2));
        let expectedVal = 0.1;
        let resultStr = 'pass';
        let resultCfg = passCfg;
        result = 1;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        positionRow.cell(`${(actualVal * 100).toFixed(2)}`, actualCfg);
        positionRow.cell(resultStr, resultCfg);
        store_ins_result(1, result);

        const headingRow = table.row();
        headingRow.cell('GPS and RTK ready without blockage', {
            padding: 10
        });
        headingRow.cell('Heading < 0.2 deg', {
            padding: 10
        });

        actualVal = val[29];
        expectedVal = 0.2;
        resultStr = 'pass';
        result = 1;
        resultCfg = passCfg;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        headingRow.cell(`${actualVal.toFixed(2)}`, actualCfg);
        headingRow.cell(resultStr, resultCfg);
        store_ins_result(2, result);
    }

    if (resultMap[3]) {
        const positionRow = table.row();
        positionRow.cell('GPS blockage for at most 3 seconds', {
            padding: 10
        });
        positionRow.cell('Position error < 10 cm', {
            padding: 10
        });
        const val = resultMap[3];
        let actualVal = Math.sqrt(Math.pow(val[5], 2) + Math.pow(val[9], 2));
        let expectedVal = 0.1;
        let resultStr = 'pass';
        let resultCfg = passCfg;
        result = 1;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        positionRow.cell(`${(actualVal * 100).toFixed(2)}`, actualCfg);
        positionRow.cell(resultStr, resultCfg);
        store_ins_result(3, result);

        const headingRow = table.row();
        headingRow.cell('GPS blockage for at most 3 seconds', {
            padding: 10
        });
        headingRow.cell('Heading < 0.2 deg', {
            padding: 10
        });

        actualVal = val[29];
        expectedVal = 0.2;
        resultStr = 'pass';
        resultCfg = passCfg;
        result = 1;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        headingRow.cell(`${actualVal.toFixed(2)}`, actualCfg);
        headingRow.cell(resultStr, resultCfg);
        store_ins_result(4, result);
    }

    if (resultMap[4]) {
        const tunnels = resultMap[4];
        tunnels.forEach(item => {
            const val = item;
            const positionRow = table.row();
            const scenrio = `In tunnel GPS and RTK lost (${val[0]})`;
            positionRow.cell(scenrio, {
                padding: 10
            });
            positionRow.cell('Lateral Position error < 0.5% of the total distance travelled', {
                padding: 10
            });
            
            let actualVal = val[40];
            let expectedVal = 0.5;
            let resultStr = 'pass';
            let resultCfg = passCfg;
            result = 1;
            if (actualVal > expectedVal) {
                resultStr = 'fail';
                resultCfg = failCfg;
                result = 0;
            }
            positionRow.cell(`${(actualVal).toFixed(2)}`, actualCfg);
            positionRow.cell(resultStr, resultCfg);
            store_ins_result(5, result);

            const longitudinalRow = table.row();
            longitudinalRow.cell(scenrio, {
                padding: 10
            });
            longitudinalRow.cell('Longitudinal Position error < 2% of the total distance travelled', {
                padding: 10
            });
            actualVal = val[41];
            expectedVal = 2;
            resultStr = 'pass';
            resultCfg = passCfg;
            result = 1;
            if (actualVal > expectedVal) {
                resultStr = 'fail';
                resultCfg = failCfg;
                result = 0;
            }
            longitudinalRow.cell(`${(actualVal).toFixed(2)}`, actualCfg);
            longitudinalRow.cell(resultStr, resultCfg);
            store_ins_result(6, result);

            const headingRow = table.row();
            headingRow.cell(scenrio, {
                padding: 10
            });
            headingRow.cell('Heading 0.5 deg', {
                padding: 10
            });
            actualVal = val[31];
            expectedVal = 0.5;
            resultStr = 'pass';
            resultCfg = passCfg;
            result = 1;
            if (actualVal > expectedVal) {
                resultStr = 'fail';
                resultCfg = failCfg;
                result = 0;
            }
            headingRow.cell(`${(actualVal).toFixed(2)}`, actualCfg);
            headingRow.cell(resultStr, resultCfg);
            store_ins_result(7, result);
        });
    }



    if (resultMap[5]) {
        const positionRow = table.row();
        positionRow.cell('Exit tunnel with GPS and RTK back (solution in recovering stage)', {
            padding: 10
        });
        positionRow.cell('Position error recovering to < 30 cm in 3 seconds', {
            padding: 10
        });
        const val = resultMap[5];
        let actualVal = Math.sqrt(Math.pow(val[5], 2) + Math.pow(val[9], 2));
        let expectedVal = 0.3;
        let resultStr = 'pass';
        let resultCfg = passCfg;
        result = 1;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        positionRow.cell(`${(actualVal * 100).toFixed(2)}`, actualCfg);
        positionRow.cell(resultStr, resultCfg);
        store_ins_result(8, result);

        const headingRow = table.row();
        headingRow.cell('Exit tunnel with GPS and RTK back (solution in recovering stage)', {
            padding: 10
        });
        headingRow.cell('Heading error recovering to < 0.6 deg in 3 seconds', {
            padding: 10
        });
        actualVal = val[29];
        expectedVal = 0.6;
        resultStr = 'pass';
        resultCfg = passCfg;
        result = 1;
        if (actualVal > expectedVal) {
            resultStr = 'fail';
            resultCfg = failCfg;
            result = 0;
        }
        headingRow.cell(`${actualVal.toFixed(2)}`, actualCfg);
        headingRow.cell(resultStr, resultCfg);
        store_ins_result(9, result);
    }
}

function gen_inceptio_allTable(doc) {
    const headerArr = ['Scenario', 'Requirement', 'Pass/fail'];
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

    const checkList = [
        {idx: 1, scenario: 'GPS and RTK ready without blockage', requirement: 'Position error < 10 cm'},
        {idx: 2, scenario: 'GPS and RTK ready without blockage', requirement: 'Heading < 0.2 deg'},
        {idx: 3, scenario: 'GPS blockage for at most 3 seconds', requirement: 'Position error < 10 cm'},
        {idx: 4, scenario: 'GPS blockage for at most 3 seconds', requirement: 'Heading < 0.2 deg'},
        {idx: 5, scenario: 'In tunnel GPS and RTK lost', requirement: 'Lateral Position error < 0.5% of the total distance travelled'},
        {idx: 6, scenario: 'In tunnel GPS and RTK lost', requirement: 'Longitudinal Position error < 2% of the total distance travelled'},
        {idx: 7, scenario: 'In tunnel GPS and RTK lost', requirement: 'Heading 0.5 deg'},
        {idx: 8, scenario: 'Exit tunnel with GPS and RTK back (solution in recovering stage)', requirement: 'Position error recovering to < 30 cm in 3 seconds'},
        {idx: 9, scenario: 'Exit tunnel with GPS and RTK back (solution in recovering stage)', requirement: 'Heading error recovering to < 0.6 deg in 3 seconds'},
    ];

    const passCfg = {
        textAlign: 'center',
        padding: 10,
        color: '#008000'
    };

    const failCfg = {
        textAlign: 'center',
        padding: 10,
        color: '#FF0000'
    };

    checkList.forEach(item => {
        if (!_.has(insResults, item.idx)) {
            return;
        }

        const row = table.row();
        row.cell(item.scenario, {
            padding: 10
        });
        row.cell(item.requirement, {
            padding: 10
        });

        let resultCfg = failCfg;
        let resultStr = 'fail';
        if (insResults[item.idx] === 1) {
            resultStr = 'pass';
            resultCfg = passCfg;
        }

        row.cell(resultStr, resultCfg);
    });
}

module.exports = {
    gen_ins_table,
    gen_inceptio_requirement,
    gen_inceptio_table,
    gen_inceptio_allTable
};