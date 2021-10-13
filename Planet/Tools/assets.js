const _DIR_ = __dirname.toLowerCase().split('/tools')[0];
const _HTML_ = _DIR_ + '/html/';
const _ASSETS_ = _HTML_ + 'assets/';
const _APP_ = require('./findAppDir')();

const _fs = require('fs');
const _walkSync = require('walkdir').sync;

let _assets = [];
let _sw = [];

(function() {
    compileAssets();
    compileServiceWorkerAssets();
    writeFile();
})();

function compileAssets() {
    let folders = ['assets/js/lib', 'assets/data'];

    folders.forEach(folder => {
        if (!_fs.existsSync(_HTML_ + folder)) return;
        _walkSync(_HTML_ + folder, path => {
            if (_fs.lstatSync(path).isDirectory()) return;

            if (!!~path.indexOf('/.')) return;
            if (!!~path.indexOf('/_')) return;
            if (!!~path.indexOf('.gz')) return;
            if (!!~path.indexOf('empty.txt')) return;

            _assets.push(path.split('/html/')[1]);
        });
    });

    if (_fs.existsSync(_ASSETS_ + 'shaders/compiled.vs')) _assets.push('assets/shaders/compiled.vs');
}

function compileServiceWorkerAssets() {
    let folders = ['assets/fonts', 'assets/css'];

    folders.forEach(folder => {
        if (!_fs.existsSync(_HTML_ + folder)) return;
        _walkSync(_HTML_ + folder, path => {
            if (_fs.lstatSync(path).isDirectory()) return;

            if (!!~path.indexOf('/.')) return;
            if (!!~path.indexOf('/_')) return;
            if (!!~path.indexOf('.gz')) return;

            _sw.push(path.split('/html/')[1]);
        });
    });

    _sw.push('assets/js/app.js');
}

function writeFile() {
    let path = _APP_ + 'config/Assets.js';

    let output = '';
    output += `window.ASSETS = ${JSON.stringify(_assets)};`;
    output += `\n`;
    output += `ASSETS.SW = ${JSON.stringify(_sw)};`;

    _fs.writeFileSync(path, output);
    _fs.chmodSync(path, '777');
}
