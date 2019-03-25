const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

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

module.exports = {
    askIfToFetchFromDB
}