const ExcelJS = require('exceljs');

/**
 * Reads an Excel file and returns a workbook object similar to xlsx structure,
 * but backed by exceljs.
 * Note: This is an async operation unlike synchronous XLSX.readFile
 * @param {string} filepath 
 */
async function readFile(filepath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);
    return {
        SheetNames: workbook.worksheets.map(ws => ws.name),
        Sheets: workbook.worksheets.reduce((acc, ws) => {
            acc[ws.name] = ws;
            return acc;
        }, {}),
        // Helper to access exceljs workbook directly if needed
        _workbook: workbook
    };
}

/**
 * Converts a worksheet to JSON array (array of objects), similar to XLSX.utils.sheet_to_json
 * @param {ExcelJS.Worksheet} worksheet 
 * @param {Object} options - { header: 1 } for array of arrays, otherwise array of objects
 */
function sheet_to_json(worksheet, options = {}) {
    const data = [];

    if (options.header === 1) {
        // Return array of arrays
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            // row.values includes a leading empty item because exceljs is 1-based, slicing it off
            // But sometimes it might behave differently depending on how it's populated.
            // row.values is [ <empty>, col1, col2, ... ]
            const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
            data.push(rowValues);
        });
        return data;
    }

    // Default: Array of objects using first row as header make keys
    let headers = null;
    worksheet.eachRow((row, rowNumber) => {
        const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
        if (rowNumber === 1) {
            headers = rowValues;
        } else {
            const rowData = {};
            let hasData = false;
            headers.forEach((header, index) => {
                let cellValue = rowValues[index];
                // Handle rich text or other cell types if necessary, typically raw value is fine
                if (cellValue && typeof cellValue === 'object' && cellValue.text) {
                    cellValue = cellValue.text;
                }
                // Handle cell value of result, might be object { formula: ..., result: ... }
                if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
                    cellValue = cellValue.result;
                }

                if (cellValue !== undefined && cellValue !== null) {
                    rowData[header] = cellValue;
                    hasData = true;
                }
            });
            if (hasData) {
                data.push(rowData);
            }
        }
    });

    return data;
}

module.exports = {
    readFile,
    utils: {
        sheet_to_json
    }
};
