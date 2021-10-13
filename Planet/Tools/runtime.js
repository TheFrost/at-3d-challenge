const _DIR_ = __dirname.toLowerCase().split('/tools')[0];
const _HTML_ = _DIR_ + '/html/';
const _TOOLS_ = _DIR_ + '/tools/';
const _ASSETS_ = _HTML_ + 'assets/';
const _APP_ = require('./findAppDir')();

const _fs = require('fs');
const _execSync = require('child_process').execSync;
const _walkSync = require('walkdir').sync;

const _config = _fs.existsSync(_DIR_ + '/project.json') ? require(_DIR_ + '/project.json') : {};

let _css = [];
let _hydra = [];
let _js = [];

(function() {
    executeRuntimeScripts();
    compileAssets();
    compileCSS();
    compileJS();
    updateHTML();
})();

function updateHydra() {
    _execSync(`node ${_TOOLS_}hydra.js`, {stdio: 'inherit'});
}

function updateModules() {
    if (_config && (_config.modules || _config.gl)) _execSync(`node ${_TOOLS_}modules.js`, {stdio: 'inherit'});
}

function executeRuntimeScripts() {
    _walkSync(_TOOLS_ + 'runtime', path => {
        if (!~path.indexOf('.js')) return;
        _execSync(`node ${path}`, {stdio: 'inherit'});
    });
}

function compileAssets() {
    _execSync(`node ${_TOOLS_}assets.js`, {stdio: 'inherit'});
}

function compileCSS() {
    if (!_fs.existsSync(_ASSETS_ + 'css')) return;
    _walkSync(_ASSETS_ + 'css', path => {
        if (_fs.lstatSync(path).isDirectory()) return;

        if (!!~path.indexOf('/.')) return;
        if (!!~path.indexOf('/_')) return;

        _css.push(path.split('/html/')[1]);
    });
}

function compileHydra() {
    _hydra.push(`assets/js/hydra/hydra-core.js`);
}

function readFile(path) {
    return new Promise(resolve => {
        _fs.readFile(_HTML_ + path, (e, s) => resolve(s.toString()));
    });
}

function compileJS() {
    let folders =  ['config', 'events', 'modules', 'util', 'models', 'mobile', 'controllers', 'views', 'layouts'];

    folders.forEach(folder => {
        if (!_fs.existsSync(_APP_ + folder)) return;
        _walkSync(_APP_ + folder, path => {
            if (_fs.lstatSync(path).isDirectory()) return;

            if (!!~path.indexOf('/.')) return;
            if (!!~path.indexOf('/_')) return;
            if (!!~path.indexOf('.gz')) return;
            if (!!~path.indexOf('.json')) return;
            if (!!~path.indexOf('.glsl')) return;
            if (!!~path.indexOf('.fs')) return;
            if (!!~path.indexOf('.vs')) return;
            if (!!~path.indexOf('.txt')) return;

            // Place Data.js at the front
            if (folder == 'models' && !!~path.indexOf('Data.js')) return _js.unshift(path.split('html/')[1]);
            _js.push(path.split('/html/')[1]);
        });
    });
}

function updateHTML() {
    let name = _DIR_.split('/').splice(-1)[0];
    let path = _HTML_ + '/index.html';

    let code = _fs.readFileSync(path, 'utf8');

    // Update title if empty
    if (!!~code.indexOf('<title></title>')) {
        code = code.replace('<title></title>', `<title>${name}</title>`);

        // See if Build.html needs a title too
        updateBuildTitle(name);
    }

    let uilId = code.includes('UIL_ID') ? code.split('UIL_ID = ')[1].split(';')[0].replace(/'/g, '') : undefined;
    let prefix = '';
    if (_DIR_.includes('sections')) prefix = _DIR_.split('/').splice(-3)[0] + '-';
    if (_DIR_.includes('platform')) prefix = _DIR_.split('/').splice(-2)[0] + '-';

    // Update lists --> Had to update to this because git gets merge conflicts which used to be resolved by regenerating the entire file
    let script = `<!-- START GENERATED FILES -->
        <script>
            window.UIL_ID = '${uilId || prefix + name}';
            window.RUNTIME_CSS = ${JSON.stringify(_css)};
            window.RUNTIME_SCRIPTS = ${JSON.stringify(_hydra.concat(_js))};
            window.RUNTIME_PATHS = window.RUNTIME_SCRIPTS;
        </script>
        <!-- END GENERATED FILES -->`;

    let split = code.split('<!-- START GENERATED FILES -->');
    let c0 = split[0];
    let inner = split[1];
    let c1 = inner.split('<!-- END GENERATED FILES -->')[1];

    code = c0 + script + c1;

    _fs.writeFileSync(path, code);
    _fs.chmodSync(path, '777');
}

function updateBuildTitle(name) {
    let path = _HTML_ + '/build.html';
    let code = _fs.readFileSync(path, 'utf8');
    code = code.replace('<title></title>', `<title>${name}</title>`);
    _fs.writeFileSync(path, code);
    _fs.chmodSync(path, '777');
}
