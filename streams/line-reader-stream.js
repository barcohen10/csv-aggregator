const { Transform } = require('stream');
const { LINE_TYPE } = require('../constants');

function createLineReaderStream(type = LINE_TYPE.BODY) {
    return new Transform({
        transform(chunk, encoding, cb) {
            let lines = chunk
                .toString()
                .split(/\r\n/g)
                .filter(line => !!line)

            if (type === LINE_TYPE.HEADER) {
                this.push(lines[0])
            } else {
                const bodyLines = lines.slice(1)
                while (bodyLines.length > 0) {
                    this.push(bodyLines.shift())
                }
            }

            cb()
        },
    });
}

module.exports = createLineReaderStream;