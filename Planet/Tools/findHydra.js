const _fs = require('fs');
const _path = require('path');

module.exports = findHydra;

function findHydra() {
    let step = ['..'];
    let count = 0;
    let found = false;
    let parent = _fs.readdirSync(_path.join.apply(null, [__dirname, ...step]));

    while (count < 5 && !found) {
        count++;
        step.push('..');
        parent = _fs.readdirSync(_path.join.apply(null, [__dirname, ...step]));
        parent.forEach(folder => {
            if (folder.toLowerCase() == 'hydra') {
                found = _path.join.apply(null, [__dirname, ...step, 'hydra']);
                found = found.toLowerCase();
            }
        });
    }

    if (!found) console.log('ERROR: HYDRA NOT FOUND IN PATH ROOT');
    return found;
}