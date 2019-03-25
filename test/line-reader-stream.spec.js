const { expect } = require('chai');
const { createLineReaderStream } = require('../streams');
const { Transform } = require('stream');

describe('createLineReaderStream spec', () => {
    let lineReaderStream = null

    beforeEach(() => {
        lineReaderStream = createLineReaderStream()
    })

    it('lineReaderStream should be a transform stream', () => {
        expect(lineReaderStream instanceof Transform).to.be.true
    });
});