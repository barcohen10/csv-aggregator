const appRoot = require('app-root-dir').get();
const Sequelize = require('sequelize');
const { join } = require('path');
const { createHash } = require('./utils');

const sequelize = new Sequelize('database', 'root', 'root', {
    dialect: 'sqlite',
    logging: false,
    storage: join(appRoot, 'database.sqlite'),
})

const getSchema = (columns) => {
    const schema = {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
    }

    for (const col of columns) {
        schema[col] = Sequelize.STRING
    }

    return schema
}

const getUniqueRecords = async (records, model) => {
    const appearances = await Promise.all(records.map(({ id }) => model.findOne({ where: { id } })))
    return records.filter((record, index) => appearances[index] === null)
}

let instance = null

class DB {
    constructor(columns) {
        if (instance) {
            return instance
        }
        instance = this
        this.columns = columns ? columns.split(',') : []
    }

    init() {
        if (!this.appModel && this.columns) {
            this.appModel = sequelize.define('app', getSchema(this.columns))
            return this.appModel.sync()
        }
        return Promise.resolve()
    }

    async insert(records) {
        if (this.appModel) {
            const uniqueRecords = await getUniqueRecords(records, this.appModel)
            return this.appModel.bulkCreate(uniqueRecords)
        } else {
            return Promise.reject('DB is not initialized')
        }
    }

    find(limit) {
        return this.appModel.findAll({ limit })
    }
}

module.exports = DB