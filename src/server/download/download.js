import axios from 'axios';

const fs = require('fs');
const { parentPort } = require('worker_threads');

let writer = null;
let status = 'init';

async function downloadFile(url, filePath) {
    status = 'downloading';
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('data', () => {

    });

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            status = 'finished';
            resolve();
        });
        writer.on('error', () => {
            status = 'error';
            reject();
        });
    });
}

parentPort.on('message', async (message) => {
    if (message.type === 'download') {
        try {
            await downloadFile(message.url, message.filePath);
            parentPort.postMessage({ type: 'status', status: 'finished' });
        } catch (error) {
            parentPort.postMessage({ type: 'status', status: 'error', error: error.message });
        }
    } else if (message.type === 'destroy') {
        if (writer && status === 'downloading') {
            writer.end();
            parentPort.postMessage({ type: 'status', status: 'destroy' });
        }
    }
});
