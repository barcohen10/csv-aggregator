const { Transform } = require('stream');
const { LINE_TYPE } = require('../constants')
const crypto = require('crypto');

const createHash = Symbol()

class HashStream {
    constructor() {
        this.hashedLines = {}
    }

    [createHash](line) {
        return crypto.createHash('md5')
        .update(line)
        .digest("hex")
    }

    getTransform() {
        const self = this;
        return new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform(line, encoding, cb) {
                let result = line

                if (line.type === LINE_TYPE.REGULAR) {
                    const hashedLine = self[createHash](line.value)
        
                    if (!self.hashedLines[hashedLine]) {
                        self.hashedLines[hashedLine] = true
                    } else {
                        result = ''
                    }
                }
                this.push(result)
                cb()
            }
        });
    }
}

module.exports = HashStream