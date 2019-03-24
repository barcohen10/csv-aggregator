const fs = require('fs');
const zlib = require('zlib');
const { Transform, PassThrough } = require('stream');
const { LINE_TYPE, MAX_CSV_LENGTH, WRITE_PATH, AGGREGATION_FINISHED } = require('../constants')
const eventEmitter = require('../emitter')

const setHeader = Symbol()
const createNewFile = Symbol()
const addLine = Symbol()
const attachEventListeners = Symbol()
const writeFileToDisc = Symbol()

class CSVStream {

    constructor() {
        this.file = ''
        this.filesCount = 1
        this.header = ''
        this.charactersLeft = MAX_CSV_LENGTH
        this[attachEventListeners]()
    }

    [attachEventListeners]() {
        eventEmitter.on(AGGREGATION_FINISHED, this[writeFileToDisc].bind(this));
    }

    [setHeader](header) {
        this.header = header.value
        this.file += `${this.header}`
        this.charactersLeft -= this.header.length
    }

    [createNewFile]() {
        this.charactersLeft = (MAX_CSV_LENGTH - this.header.length)
        this[writeFileToDisc](this.file)
        this.file = `${this.header}`
    }

    [addLine](line) {
        this.file += `\n${line.value}`
        this.charactersLeft -= line.value.length
    }

    [writeFileToDisc](file = this.file, fileName = `aggregated${this.filesCount}`) {
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
                console.log(`${filePath} has been created`)
            })
        this.filesCount++
    }

    getTransform() {
        const self = this
        return new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform(line, encoding, cb) {
                if (line !== '') {
                    if (!self.header && line.type === LINE_TYPE.HEADER) {
                        self[setHeader](line)
                        return cb(null, line)
                    }

                    if (self.charactersLeft >= line.value.length) {
                        self[addLine](line)
                    } else {
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