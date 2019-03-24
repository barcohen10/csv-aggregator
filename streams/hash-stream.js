const { Transform } = require('stream');
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
            transform(line, encoding, cb) {
                let result = line
                const hashedLine = self[createHash](line)

                if (!self.hashedLines[hashedLine]) {
                    self.hashedLines[hashedLine] = true
                } else {
                    result = ''
                }

                this.push(result)
                cb()
            }
        });
    }
}

module.exports = HashStream