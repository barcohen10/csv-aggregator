const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');
const { Transform, PassThrough } = require('stream');
const { MAX_CSV_LENGTH, WRITE_PATH, WRITE_LAST_FILE_IN_MEMORY } = require('../constants')
const eventEmitter = require('../emitter')
const DB = require('../db');

const createNewFile = Symbol()
const addLine = Symbol()
const attachEventListeners = Symbol()
const writeFileToDisc = Symbol()
const writeFileToDB = Symbol()
const saveAndCreate = Symbol()

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

class CSVStream {

    constructor(header) {
        this.header = header
        this.filesCount = 0
        this.db = new DB(header)
        this[createNewFile]()
        this[attachEventListeners]()
    }

    [attachEventListeners]() {
        eventEmitter.on(WRITE_LAST_FILE_IN_MEMORY, this[saveAndCreate].bind(this, '', true));
    }

    [createNewFile]() {
        this.charactersLeft = (MAX_CSV_LENGTH - this.header.length)
        this.file = `${this.header}`
    }

    [writeFileToDisc](file = this.file, filePath = `${WRITE_PATH}/aggregated${this.filesCount}.csv.gz`) {
        if (!fs.existsSync(WRITE_PATH)) {
            fs.mkdirSync(WRITE_PATH)
        }
        const bufferStream = new PassThrough()
        const writeStream = fs.createWriteStream(filePath)

        bufferStream.end(new Buffer(file))

        bufferStream.pipe(zlib.createGzip()).pipe(writeStream)
    }

    async [writeFileToDB](file = this.file) {
        if (!this.db.initialized) {
            await this.db.init()
        }
        const records = file.split(/\r\n/g)
            .filter(line => !!line)
            .map(line => csvRowToObject(this.header.split(','), line.toString()))

        await this.db.insert(records)
    }

    [addLine](line) {
        this.file += `\r\n${line}`
        this.charactersLeft -= line.length
    }

    async [saveAndCreate](line, isLast = false) {
        this.filesCount++
        this[writeFileToDisc]()
        await this[writeFileToDB]()
        console.log(`${WRITE_PATH}/aggregated${this.filesCount}.csv.gz created and data saved to DB`)

        if (!isLast) {
            this[createNewFile]()
            this[addLine](line)
        } else {
            console.log('Done! to fetch DB data run: npm read-db')
        }
    }

    getTransform() {
        const self = this
        return new Transform({
            async transform(line, encoding, cb) {
                if (line !== '') {
                    if (self.charactersLeft >= line.length) {
                        self[addLine](line)
                    } else {
                        await self[saveAndCreate](line)
                    }
                }
                cb(null, line)
            }
        });
    }
}

module.exports = CSVStream