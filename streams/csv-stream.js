const fs = require('fs');
const zlib = require('zlib');
const { Transform, PassThrough } = require('stream');
const { MAX_CSV_LENGTH, WRITE_PATH, WRITE_LAST_FILE_IN_MEMORY, AGGREGATION_FINISHED } = require('../constants')
const eventEmitter = require('../emitter')

const createNewFile = Symbol()
const addLine = Symbol()
const attachEventListeners = Symbol()
const writeFileToDisc = Symbol()

class CSVStream {

    constructor(header) {
        this.header = header
        this.filesCount = 0
        this[createNewFile]()
        this[attachEventListeners]()
    }

    [attachEventListeners]() {
        eventEmitter.on(WRITE_LAST_FILE_IN_MEMORY, this[writeFileToDisc].bind(this, true));
    }

    [createNewFile]() {
        this.charactersLeft = (MAX_CSV_LENGTH - this.header.length)
        this.file = `${this.header}`
    }

    [writeFileToDisc](isLast = false, file = this.file, fileName = `aggregated${++this.filesCount}`) {
        if (!fs.existsSync(WRITE_PATH)) {
            fs.mkdirSync(WRITE_PATH)
        }
        const bufferStream = new PassThrough()
        const filePath = `${WRITE_PATH}/${fileName}.csv.gz`
        const writeStream = fs.createWriteStream(filePath)

        bufferStream.end(new Buffer(file))

        bufferStream
            .pipe(zlib.createGzip())
            .pipe(writeStream)
            .on('finish', () => {
                if (isLast) {
                    console.log(`${this.filesCount} compressed CSV files created under ${WRITE_PATH}`)
                    eventEmitter.emit(AGGREGATION_FINISHED);
                }
            })
    }

    [addLine](line) {
        this.file += `\r\n${line}`
        this.charactersLeft -= line.length
    }

    getTransform() {
        const self = this
        return new Transform({
            transform(line, encoding, cb) {
                if (line !== '') {
                    if (self.charactersLeft >= line.length) {
                        self[addLine](line)
                    } else {
                        self[writeFileToDisc]()
                        self[createNewFile]()
                        self[addLine](line)
                    }
                }
                cb(null, line)
            }
        });
    }
}

module.exports = CSVStream