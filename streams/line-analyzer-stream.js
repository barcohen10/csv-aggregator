const { Transform } = require('stream');
const { LINE_TYPE } = require('../constants')

class LineAnalyzerStream {
    constructor() {
        this.isHeaderDefined = false
    }

    getTransform() {
        const self = this;

        return new Transform({
            readableObjectMode: true,
            transform(chunk, encoding, cb) {
                let type = LINE_TYPE.REGULAR

                if (!self.isHeaderDefined) {
                    self.isHeaderDefined = true
                    type = LINE_TYPE.HEADER
                }
                this.push({
                    type,
                    value: chunk.toString(),
                })
                cb()
            }
        });
    }
}

module.exports = LineAnalyzerStream