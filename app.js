const fs = require('fs');
const zlib = require('zlib');
const { LineStream } = require('byline');
const { DATA_PATH, AGGREGATION_FINISHED } = require('./constants');
const { LineAnalyzerStream, HashStream, CSVStream } = require('./streams')
const eventEmitter = require('./emitter')

/**
 * Returns all compressed files in directory
 * 
 * @param directoryPath {String} path of directory
 */
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

(async () => {
    try {
        const allFiles = await getCompressedFiles(DATA_PATH)
        const lineAnalyzerStream = new LineAnalyzerStream()
        const hashStream = new HashStream()
        const csvStream = new CSVStream()

        const processFile = (fileName) => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(`${DATA_PATH}/${fileName}`)
                    .pipe(zlib.createGunzip())
                    .pipe(new LineStream())
                    .pipe(lineAnalyzerStream.getTransform())
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