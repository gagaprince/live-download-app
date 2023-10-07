
import { getWorkSpace } from '../configUtil';
import { formatDate, formatDay } from '../util/date';
import { Download } from './download';

const fs = require('fs');
const path = require('path');

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
        this.size = 0;

        const workspace = getWorkSpace();
        this.roomInfo = roomInfo;
        this.flvLink = roomInfo.flvLink || '';
        this.canDownload = !!this.flvLink;
        this.fileDir = path.resolve(workspace, formatDay(), roomInfo.owner, formatDate());
        this.filePath = path.resolve(this.fileDir, `${Date.now()}.flv`);
        this.beginTime = Date.now();
    }

    toJSONObject() {
        return {
            isDone: this.isDone,
            size: this.size,
            roomInfo: this.roomInfo,
            fileDir: this.fileDir,
            filePath: this.filePath,
            beginTime: this.beginTime,
        };
    }

    getBeginTime() { return this.beginTime; }

    startTimer() {
        this.timer = setInterval(() => {
            // 每隔1s 检测一下文件大小
            try {
                const stat = fs.statSync(this.filePath);
                const size = stat.size;
                this.size = size;
                this.changeListeners.forEach((callback) => callback(size));
            } catch (e) {
                console.error(e);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
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
            const downloader = new Download({
                url: this.flvLink,
                filePath: this.filePath,
                success: () => {
                    this.isDone = true;
                    this.destroy();
                },
                fail: (e) => {
                    console.log(`Error: ${e}`);
                    this.destroy();
                },
            });
            this.downloader = downloader;
            this.downloader.startDownload();
            this.startTimer();
        } else {
            this.destroy();
            throw new Error('当前任务不可下载');
        }
    }

    destroy() {
        if (this.status === 'destroy') return;
        this.status = 'destroy';
        this.isDone = true;
        this.stopTimer();
        if (this.downloader) {
            this.downloader.stopDownload();
        }
        this.finishListeners.forEach((fun) => fun());
    }
}
