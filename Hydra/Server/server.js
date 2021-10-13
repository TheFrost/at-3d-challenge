const _fs = require('fs');
const _path = require('path');
const _http = require('http');
const _https = require('https');
const _args = require('./args');
const _ecstatic = require('ecstatic');
const _execSync = require('child_process').execSync;
const _PATH_ = __dirname.toLowerCase().split(`${_path.sep}hydra${_path.sep}`)[0];

global.HYDRA_PATH = _path.join(_PATH_, 'hydra', 'server');

let _userAgent;
let _ports = {
    // browser connection
    http: 80,
    https: 443,

    // saving files to project
    dataHttp: 8017,
    dataHttps: 8018,

    // saves uil
    uilWs: 8989,
    uilWss: 8990
};


// Have edited ecstatic library with the following changes
// 70: options.onRequest && options.onRequest(req.url.toLowerCase(), res);
// 71: if (res._headerSent) return;
// 207: stat = options.onServe && options.onServe(file.toLowerCase()) || stat;
if (require.main === module) {
    (function() {
        const config = _args(process.argv);
        init(config);
    })();
}

module.exports = init;

function init(args) {
    // creates static hydra server
    createServer({ args });

    // creates server that's able to create and write files/images to local file system under
    createDataServer({ args });

    // uil socket connection
    createUILSocket({ args });
}

// START [SERVERS]
function createServer({ args }) {
    let ecstaticOptions = {
        root: _PATH_,
        cors: true,
        gzip: true,
        showDotfiles: false,
        humanReadable: true,
        mimeType: { 'application/wasm': ['wasm'] },
        contentType: { 'audio/mpeg': ['mp3'] },

        // Custom functions
        cache: decideCache,
        onRequest: onRequest,
        onServe: onServe
    };

    _http.createServer(_ecstatic(ecstaticOptions)).listen(_ports.http);
    //_https.createServer(certs(), _ecstatic(ecstaticOptions)).listen(_ports.https);
}

function createDataServer({ args }) {
    let handleUILRequest = async (req, res, url, data) => {
        if (data.charAt(0) === '{') data = JSON.parse(data);

        let script = url.toLowerCase().split('/uil/')[1];
        let project = url.toLowerCase().split('/html')[0].slice(1);
        let path = _path.join(__dirname, '..', '..', project);
        try {
            let scriptPath = _path.join(path, 'Tools', 'uil', script+'.js');
            let fn = require(scriptPath);
            let e = await fn(project, data);
            res.end(JSON.stringify(e));
        } catch(e) {
            console.log(e);
            res.end('ERROR');
        }
    };

    let handleRequest = (req, res) => {
        if (req.method !== 'POST') {
            res.writeHead(500);
            res.end();
            return;
        }

        downloadPost(req, (data) => {
            res.writeHead(200, {'Access-Control-Allow-Origin' : '*'});

            let url = req.url.split('?');
            let query = url[1] || '';
            url = url[0];

            if (url.includes('http://')) {
                url = url.split('http://')[1].split('/');
                url.shift();
                url = '/' + url.join('/');
            }

            if (req.url.includes('/uil/')) return handleUILRequest(req, res, url, data);

            let folderPath = url.substring(0, url.lastIndexOf('/'));
            let dir = _path.join(_PATH_, folderPath);

            if (!_fs.existsSync(dir)) {
                _fs.mkdirSync(dir);
                _fs.chmodSync(dir, '777');
            }

            try {
                let writePath = _path.join(_PATH_, url);

                if ( ~url.indexOf(['.png'])) {
                    _fs.writeFileSync(writePath, data.replace(/^data:([A-Za-z-+/]+);base64,/, ''), 'base64');
                } else if (!!~query.indexOf(['compress']) || !!~url.indexOf(['.txt']) || !!~url.indexOf(['.csv'])) {
                    _fs.writeFileSync(writePath, data);
                } else {
                    _fs.writeFileSync(_PATH_ + url, JSON.stringify(JSON.parse(data), null, '\t'));
                }

                try { _fs.chmodSync(_PATH_ + url, '777'); } catch(e) {console.log(e); }

                res.end('OK');
            } catch (err) {
                console.log(err);
                res.end('ERROR');
            }
        });
    };

    _http.createServer(handleRequest).listen(_ports.dataHttp);
    // _https.createServer(certs(), handleRequest).listen(_ports.dataHttps);
}

function createUILSocket({ args }) {
    const WebSocket = require('ws');

    const ws = new WebSocket.Server({ port: _ports.uilWs });
    ws.on('connection', onConnection(ws));

    global.ws = ws;
}
// END [SERVERS]


// START [UTILS]
function onConnection(ws) {
    return (socket) => {
        socket.on('message', d => {
            if (d == 'ping' || d == 'pong') return;
            ws.clients.forEach(s => {
                try {
                    s.send(d);
                } catch(e) {
                    console.log(e);
                }
            });
        });
    };
}

function downloadPost(request, callback) {
    let body = '';

    request.on('data', function(chunk) {
        body += chunk;
    });

    request.on('end', function() {
        if (callback) callback(body);
        request = null;
    });
}

function triggerES5(url, res) {
    let script = _PATH_ + '/' + url.split('//')[1].split('html')[0].split('/').splice(1).join('/') + 'tools/runtimeES5.js';
    if (_fs.existsSync(script)) {
        _execSync(`node ${script}`, {stdio: 'inherit'});

        res.statusCode = 200;
        res.end();
    }
}

function triggerRuntime(file) {
    let runtime = file.replace(`html${_path.sep}index.html`, `tools${_path.sep}runtime.js`);

    if (_fs.existsSync(runtime)) {
        try {
            _execSync(`node ${runtime} "${_userAgent}"`, {stdio: 'inherit'});
        } catch(e) {
            let folderPath = runtime.split('/tools')[0] + '/tools';
            _execSync(`npm i -D walkdir fs-extra`, {cwd: folderPath, stdio: 'inherit'});
            _execSync(`node ${runtime} "${_userAgent}"`, {stdio: 'inherit'});
        }
    }

    // Return updated stat so stat.size reflects modified index
    return _fs.statSync(file);
}

function onRequest(url, res, req) {
    _userAgent = req.headers['user-agent'] || 'aura';
    if (~url.indexOf('/runtime/?')) triggerES5(url, res);
}

function onServe(path) {
    if (path.includes(`html${_path.sep}index.html`)) return triggerRuntime(path);
}

function decideCache (file) {
    if (!!~file.indexOf('.js') && !~file.indexOf('.json')) return 0;
    if (~file.indexOf('.css')) return 0;
    if (~file.indexOf('assets/data')) return 0;
    if (~file.indexOf('.html')) return 0;
    if (~file.indexOf('.glsl')) return 0;
    if (~file.indexOf('.vs')) return 0;
    if (~file.indexOf('.fs')) return 0;
    if (~file.indexOf('.wasm')) return 0;
    return 300;
}

function certs() {
    if (_fs.existsSync(_path.join(__dirname, 'cert/cert.pfx'))) {
        return {
            pfx: _fs.readFileSync(_path.join(__dirname, 'cert/cert.pfx')),
            passphrase: 'password'
        };
    } else {
        return {
            key: _fs.readFileSync(_path.join(__dirname, 'cert/server.key')),
            cert: _fs.readFileSync(_path.join(__dirname, 'cert/server.crt'))
        };
    }
}

// END [UTILS]
