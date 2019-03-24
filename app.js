const fs = require('fs');
const zlib = require('zlib');
const { DATA_PATH, WRITE_LAST_FILE_IN_MEMORY, WRITE_PATH, AGGREGATION_FINISHED } = require('./constants');
const { createLineReaderStream, HashStream, CSVStream } = require('./streams');
const eventEmitter = require('./emitter');
const { getCompressedFiles, getCsvHeader, csvRowToObject } = require('./utils');
const DB = require('./db');

(async () => {
    try {
        const allFiles = await getCompressedFiles(DATA_PATH)
        const csvHeader = await getCsvHeader(allFiles[0])
        const hashStream = new HashStream()
        const csvStream = new CSVStream(csvHeader)

        const aggregate = async () => {
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
            console.log('Starts to aggregate and compress csv files')
            for (fileName of allFiles) {
                await processFile(fileName)
            }

            eventEmitter.emit(WRITE_LAST_FILE_IN_MEMORY);
        }
        const writeAggregatedFilesToDB = async () => {
            const writeFileToDB = (fileName, db) => {
                const records = []
                return new Promise((resolve, reject) => {
                    fs.createReadStream(`${WRITE_PATH}/${fileName}`)
                        .pipe(zlib.createGunzip())
                        .pipe(createLineReaderStream())
                        .on('data', row => {
                            const record = csvRowToObject(csvHeader.split(','), row.toString())
                            records.push(record)
                        })
                        .on('finish', () => {
                            db.insert(records).then(resolve)
                        })
                        .on('error', () => {
                            reject()
                        })
                })
            }
            console.log('Starts to write aggregated files to DB')
            const aggregatedFiles = await getCompressedFiles(WRITE_PATH)
            const db = new DB(csvHeader)
            await db.init()

            for (fileName of aggregatedFiles) {
                await writeFileToDB(fileName, db)
            }

            console.log('unique CSV rows has been written to ./database.sqlite')
            console.log('Done')
        }

        eventEmitter.on(AGGREGATION_FINISHED, () => writeAggregatedFilesToDB());

        aggregate()
    }
    catch (e) {
        console.log(e)
    }
})()