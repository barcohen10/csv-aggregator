const fs = require('fs');
const zlib = require('zlib');
const { DATA_PATH, AGGREGATION_FINISHED, LINE_TYPE } = require('./constants');
const { createLineReaderStream, HashStream, CSVStream } = require('./streams')
const eventEmitter = require('./emitter')

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
        .on('error', err => reject(err));
    });
}

(async () => {
    try {
        const allFiles = await getCompressedFiles(DATA_PATH)
        const csvHeader = await getCsvHeader(allFiles[0])
        const hashStream = new HashStream()
        const csvStream = new CSVStream(csvHeader)

        const processFile = (fileName) => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(`${DATA_PATH}/${fileName}`)
                    .pipe(zlib.createGunzip())
                    .pipe(createLineReaderStream())
                    .pipe(hashStream.getTransform())
                    .pipe(csvStream.getTransform())
                    .on('finish', () => {
                        resolve()
                    })
                    .on('error', () => {
                        reject()
                    })
            })
        }

        for (fileName of allFiles) {
            await processFile(fileName)
        }

        eventEmitter.emit(AGGREGATION_FINISHED);
    }
    catch (e) {
        console.log(e)
    }
})()