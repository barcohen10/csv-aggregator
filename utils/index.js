const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');
const { LINE_TYPE, DATA_PATH } = require('../constants');
const { createLineReaderStream } = require('../streams');

function getCompressedFiles(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return reject(err)
            }
            resolve(files.filter(f => f.includes(".gz")
                && !fs.lstatSync(`${directoryPath}/${f}`).isDirectory()))
        })
    })
}

function getCsvHeader(fileName) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(`${DATA_PATH}/${fileName}`)
            .pipe(zlib.createGunzip())
            .pipe(createLineReaderStream(LINE_TYPE.HEADER))
            .on('data', chunk => resolve(chunk.toString()))
            .on('error', err => reject(err))
    })
}

function csvRowToObject(keys, row) {
    const obj = { id: crypto.createHash('md5').update(row).digest("hex") }
    const rowArray = row.split(',')

    for (let i = 0; i < rowArray.length; i++) {
        if (keys[i]) {
            obj[keys[i]] = rowArray[i]
        }
    }
    return obj
}

module.exports = {
    getCompressedFiles,
    getCsvHeader,
    csvRowToObject,
}