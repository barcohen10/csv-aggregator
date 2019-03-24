const DATA_PATH = './data'
const WRITE_PATH = './data/aggregated'
const MAX_CSV_LENGTH = 1024
const LINE_TYPE = {
    HEADER: 'header',
    REGULAR: 'regular'
}
const AGGREGATION_FINISHED = 'aggregation_finished'

module.exports = {
    DATA_PATH,
    WRITE_PATH,
    MAX_CSV_LENGTH,
    LINE_TYPE,
    AGGREGATION_FINISHED,
}