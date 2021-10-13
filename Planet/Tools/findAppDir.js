const _DIR_ = __dirname.toLowerCase().split('/tools')[0];
const _JS_ = _DIR_ + '/html/assets/js/';

const _fs = require('fs');

module.exports = findAppDir;

function findAppDir() {

    // Return app if exists
    if (_fs.existsSync(_JS_ + 'app/')) return _JS_ + 'app/';

    // Check if the name folder exists
    let name = _DIR_.split('/').splice(-1)[0].toLowerCase();
    if (_fs.existsSync(_JS_ + name + '/')) return _JS_ + name + '/';

    console.log('ERROR: JS DIRECTORY NOT FOUND');
}