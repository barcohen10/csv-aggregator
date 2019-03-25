const { expect } = require('chai');
const { CSVStream } = require('../streams');
const DB = require('../db');
const { Transform } = require('stream');

describe('CSVStream spec', () => {
    const csvHeader = 'firstName, familyName, age'
    let csvStream = null

    beforeEach(() => {
        csvStream = new CSVStream(csvHeader)
    })

    it('should set header', () => {
        expect(csvStream.header).to.be.equal(csvHeader)
    });

    it('should set filesCount to 0', () => {
        expect(csvStream.filesCount).to.be.equal(0)
    });

    it('should create db instance', () => {
        expect(csvStream.db instanceof DB).to.be.true
    });

    it('getTransform method should be defined', () => {
        expect(csvStream.getTransform).to.exist
    })

    it('getTransform method should return Transform object', () => {
        expect(csvStream.getTransform() instanceof Transform).to.be.true
    })
});