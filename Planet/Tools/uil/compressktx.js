const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const compressorPath = path.join(global.HYDRA_PATH, 'node_modules', 'texture-compressor', 'lib', 'index.js');
const Jimp = require(path.join(global.HYDRA_PATH, 'node_modules', 'jimp'));
const rootPath = path.join(global.HYDRA_PATH, '..', '..');

Math.isPowerOf2 = function(w, h) {
    let test = value => (value & (value - 1)) == 0;
    return test(w) && test(h);
}

Math.roundPowerOf2 = function(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
}

function createPromise() {
    let temp_resolve, temp_reject;
    const promise = new Promise((resolve, reject) => {
        temp_resolve = resolve;
        temp_reject = reject;
    });
    promise.resolve = temp_resolve;
    promise.reject = temp_reject;
    return promise;
}

function exec(cmd) {
    let promise = createPromise();
    child_process.exec(cmd, (e, d) => {
        if (!e) promise.resolve();
        else promise.reject(e);
    });
    return promise;
}

module.exports = async function(project, {src}) {
    if (!src) throw 'Error';

    let imagePath = path.join.apply(null, [rootPath, project, 'HTML', ...src.split('/')]);
    let folderPath = imagePath.split('.')[0];
    let fileName = imagePath.split(path.sep);
    fileName = fileName[fileName.length-1];

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    let img = await Jimp.read(imagePath);
    let {width, height} = img.bitmap;
    if (!Math.isPowerOf2(width, height)) {
        width = height = Math.roundPowerOf2(Math.max(width, height));
    }

    await img.resize(width, height);
    await img.flip(false, true);
    await img.write(path.join(folderPath, fileName));

    let imgPath = path.join(folderPath, fileName);
    let imgOut = path.join(folderPath, fileName.split('.')[0]);

    let mipmap = fileName.includes('mipmap') ? '-m' : '';

    try {
        if (imagePath.includes('png')) {
            await Promise.all([
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-dxt.ktx -t s3tc -c dxt5 ${mipmap}`),
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-astc.ktx -t astc -c astc -b 8x8 ${mipmap}`),
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-pvrtc.ktx -t pvr -c pvrtc1 -b 4 -a ${mipmap}`)
            ]);
        } else {
            await Promise.all([
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-dxt.ktx -t s3tc -c dxt1 ${mipmap}`),
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-astc.ktx -t etc -c etc1 ${mipmap}`),
                exec(`node ${compressorPath} -i ${imgPath} -o ${imgOut}-pvrtc.ktx -t pvr -c pvrtc1 -b 4 ${mipmap}`),
            ]);
        }
    } catch(e) {
        throw e;
    }

    await Promise.all([
        exec(`gzip -9 -k ${imgOut}-dxt.ktx`),
        exec(`gzip -9 -k ${imgOut}-astc.ktx`),
        exec(`gzip -9 -k ${imgOut}-pvrtc.ktx`)
    ]);

    try {
        fs.unlinkSync(imgPath);
        fs.chmodSync(folderPath, '777');
        fs.chmodSync(imgOut + '-dxt.ktx', '777');
        fs.chmodSync(imgOut + '-astc.ktx', '777');
        fs.chmodSync(imgOut + '-pvrtc.ktx', '777');
        fs.chmodSync(imgOut + '-dxt.ktx.gz', '777');
        fs.chmodSync(imgOut + '-astc.ktx.gz', '777');
        fs.chmodSync(imgOut + '-pvrtc.ktx.gz', '777');
    } catch(e) {

    }

    return 'OK';
}