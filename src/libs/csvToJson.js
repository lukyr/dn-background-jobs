const path = require('path');
const rootPath = path.resolve('./');
const csv = require('csvtojson');

module.exports = (pathFileName) => {
    const csvFilePath = `${rootPath}/${pathFileName}`;
    return csv().fromFile(csvFilePath);
}
