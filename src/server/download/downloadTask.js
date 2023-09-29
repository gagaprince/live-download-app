
import { getWorkSpace } from '../configUtil';
import { formatDate } from '../util/date';

const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');

/**
 * 单个下载任务的类
 * 管理项
 * 下载地址
 * 文件地址  需要借助 configUtil
 * 文件命名
 * 定期返回文件大小
 */

export class DownloadTask {
    constructor(roomInfo) {
        this.timer = null;
        this.isDone = false;
        this.changeListeners = [];
        this.finishListeners = [];
        this.downloadWorker = null;
        this.status = 'normal';

        const workspace = getWorkSpace();
        this.roomInfo = roomInfo;
        this.flvLink = roomInfo.flvLink || '';
        this.canDownload = !!this.flvLink;
        this.fileDir = path.resolve(workspace, roomInfo.owner, formatDate());
        this.filePath = path.resolve(this.fileDir, `${Date.now()}.flv`);
    }

    startTimer() {
        this.timer = setInterval(() => {
            // 每隔1s 检测一下文件大小
            try {
                const stat = fs.statSync(this.filePath);
                const size = stat.size;
                this.changeListeners.forEach((callback) => callback(size));
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    onProgress(callback) {
        this.changeListeners.push(callback);
    }

    onFinished(callback) {
        this.finishListeners.push(callback);
    }

    exec() {
        if (this.canDownload) {
            if (!fs.existsSync(this.fileDir)) {
                fs.mkdirSync(this.fileDir, { recursive: true }); // recursive选项确保创建嵌套目录
            }
            const workerPath = path.join(__dirname, 'download.js');
            console.log('workerPath', workerPath);
            const downloadWorker = new Worker(workerPath);
            this.downloadWorker = downloadWorker;

            this.startTimer();
            downloadWorker.on('message', (message) => {
                if (message.type === 'status') {
                    console.log(`Download status: ${message.status}`);
                    if (message.error) {
                        console.log(`Error: ${message.error}`);
                    }
                    this.stopTimer();
                    this.isDone = true;
                    this.destroy();
                }
            });

            downloadWorker.postMessage({
                type: 'download',
                url: this.flvLink,
                filePath: this.filePath,
            });
        } else {
            this.destroy();
            throw new Error('当前任务不可下载');
        }
    }

    destroy() {
        this.status = 'destroy';
        if (this.downloadWorker) {
            this.downloadWorker.postMessage({
                type: 'destroy',
            });
        }
        this.finishListeners.forEach((fun) => fun());
    }
}
