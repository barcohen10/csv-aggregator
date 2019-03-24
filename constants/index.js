const DATA_PATH = './data'
const WRITE_PATH = './data/aggregated'
const MAX_CSV_LENGTH = 1024
const LINE_TYPE = {
    HEADER: 'header',
    BODY: 'body'
}
const WRITE_LAST_FILE_IN_MEMORY = 'write_last_file_in_memory'

module.exports = {
    DATA_PATH,
    WRITE_PATH,
    LINE_TYPE,
    MAX_CSV_LENGTH,
    WRITE_LAST_FILE_IN_MEMORY,
}