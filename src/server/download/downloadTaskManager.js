import { DownloadTask } from './downloadTask';
import { addFile } from './saveFile';


// const downloadTaskList = [];
const downloadTaskMap = {};

export const isDownloading = (secUserId) => !!downloadTaskMap[secUserId];

export const addDownloadTask = (roomInfo = {}) => {
    if (isDownloading(roomInfo.secUserId)) return;
    const task = new DownloadTask(roomInfo);
    try {
        // task.onProgress((size) => {
        //     console.log('文件大小:', size);
        // });
        task.onFinished(() => {
            downloadTaskMap[roomInfo.secUserId] = undefined;
            addFile(task.toJSONObject());
        });
        task.exec();
        downloadTaskMap[roomInfo.secUserId] = task;
        setTimeout(() => {
            addFile(task.toJSONObject());
        }, 10000);
    } catch (e) {
        // 没有下载信息
        console.log(e);
    }
};

export const saveAllDownloadFile = () => {
    Object.keys(downloadTaskMap).forEach((key) => addFile(downloadTaskMap[key].toJSONObject()));
};

export const stopDownloadTask = (secUserId) => {
    const task = downloadTaskMap[secUserId];
    if (task) task.destroy();
};

export const getDownloadTaskList = () => {
    const taskList = Object.keys(downloadTaskMap).map((key) => downloadTaskMap[key] && downloadTaskMap[key].toJSONObject());
    return taskList.filter((task) => !!task && !task.isDone);
};
