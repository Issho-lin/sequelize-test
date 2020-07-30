const fs = require('fs');

function get(key) {
    fs.readFile('./db.json', (err, data) => {
        const json = data.toString() ? JSON.parse(data) : {};
        console.log(json[key]);
    });
}

function set(key, val) {
    fs.readFile('./db.json', (err, data) => {
        const json = data.toString() ? JSON.parse(data) : {};
        json[key] = val;
        fs.writeFile('./db.json', JSON.stringify(json), err => {
            if (err) {
                throw err;
            } else {
                console.log('success');
            }
        })
    });
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', input => {
    const [opt, key, val] = input.split(' ');
    if (opt === 'get') {
        get(key);
    } else if (opt === 'set') {
        set(key, val);
    } else if (opt === 'quit') {
        rl.close();
    } else {
        console.log('command not found');
    }
});
rl.on('close', function () {
    process.exit();
});