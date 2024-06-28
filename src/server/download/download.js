import axios from 'axios';

const fs = require('fs');

export class Download {
    constructor({
        url, filePath,
        timeout = 10,
        success,
        fail,
        headers,
    }) {
        this.writer = null;
        this.status = 'init';
        this.downloadUrl = url;
        this.filePath = filePath;
        this.headers = headers;
        this.success = success;
        this.fail = fail;
        this.timeout = timeout;
        this.timeoutId = null;
    }

    async downloadFile() {
        const options = {
            url: this.downloadUrl,
            method: 'GET',
            responseType: 'stream',
        };
        if (this.headers) {
            options.headers = this.headers;
        }
        const response = await axios(options);

        const writer = fs.createWriteStream(this.filePath);
        this.writer = writer;

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            response.data.on('data', () => {
                // 当收到新的数据时，清除旧的定时器并设置新的定时器
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }
                this.timeoutId = setTimeout(() => {
                    console.log(`${this.timeout} seconds without data, stop download`);
                    writer.close();
                    this.status = 'finished';
                    resolve();
                }, this.timeout * 1000);
            });
            writer.on('finish', () => {
                this.status = 'finished';
                resolve();
            });
            writer.on('error', (e) => {
                this.status = 'error';
                reject(e);
            });
        });
    }

    async startDownload() {
        this.status = 'downloading';
        try {
            await this.downloadFile();
            if (this.success) this.success();
        } catch (error) {
            if (this.fail) this.fail(error);
        }
    }

    stopDownload() {
        if (this.writer && this.status === 'downloading') {
            this.writer.end();
        }
    }
}
