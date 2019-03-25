const fs = require('fs');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function askIfToFetchFromDB(cb) {
    rl.question('Fetch results from DB? (yes/no)\n', (answer) => {
        if (answer === 'yes') {
            rl.question('How many rows?\n', (amount) => {
                if (!isNaN(amount)) {
                    cb(amount)
                }
                rl.close();
            });
        } else {
            rl.close();
        }
    });
}

function getCompressedFiles(directoryPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return reject(err)
            }
            resolve(files.filter(f => f.includes(".gz")
                && !fs.lstatSync(`${directoryPath}/${f}`).isDirectory()))
        })
    })
}

module.exports = {
    askIfToFetchFromDB,
    getCompressedFiles,
}