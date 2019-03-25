const { expect, spy } = require('chai');
const DB = require('../db')

describe('DB spec', () => {
    const columns = 'firstName, familyName, age'
    let db = null

    before(() => {
        db = new DB(columns)
    })

    it('should be a singelton class', () => {
        expect(new DB()).to.be.equal(db)
    });

    it('should set columns', () => {
        expect(db.columns).to.eql(columns.split(','))
    });

    it('should set initialized flag', () => {
        expect(db.initialized).to.be.false
    })

    it('init method should be defined', () => {
        expect(db.init).to.exist
    })

    it('find method should be defined', () => {
        expect(db.find).to.exist
    })

    it('insert method should be defined', () => {
        expect(db.insert).to.exist
    })

    it('app model should be initialized', async () => {
        await db.init()
        expect(db.appModel).to.exist
        expect(db.initialized).to.be.true
    })
});