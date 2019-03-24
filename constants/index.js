const DATA_PATH = './data'
const WRITE_PATH = './data/aggregated'
const MAX_CSV_LENGTH = 1024
const LINE_TYPE = {
    HEADER: 'header',
    BODY: 'body'
}
const AGGREGATION_FINISHED = 'aggregation_finished'

module.exports = {
    DATA_PATH,
    WRITE_PATH,
    LINE_TYPE,
    MAX_CSV_LENGTH,
    AGGREGATION_FINISHED,
}