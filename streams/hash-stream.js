const { Transform } = require('stream');
const crypto = require('crypto');

class HashStream {
    constructor() {
        this.hashedLines = {}
    }

    getTransform() {
        const self = this
        return new Transform({
            transform(line, encoding, cb) {
                let result = line
                const hashedLine = crypto.createHash('md5').update(line.toString()).digest("hex")

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