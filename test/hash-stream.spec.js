const { expect } = require('chai');
const { HashStream } = require('../streams');
const { Transform } = require('stream');

describe('HashStream spec', () => {
    let hashStream = null

    beforeEach(() => {
        hashStream = new HashStream()
    })

    it('hashedLines should be defined', () => {
        expect(hashStream.hashedLines).to.exist
        expect(hashStream.hashedLines).to.be.a('object')
    });

    it('getTransform method should be defined', () => {
        expect(hashStream.getTransform).to.exist
    })
});