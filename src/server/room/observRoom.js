import { isDownloading } from '../download/downloadTaskManager';
import { addDownloadTaskByWebRoomId } from '../download/index';
import { anysisFromLink, addRoom } from './addRoom';
import { selectRoomById } from './selectRoom';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

const observeList = [];
const maxObserveLength = 100;

const initInterval = () => {
    let isRunning = false;
    setInterval(async () => {
        if (isRunning) return;
        isRunning = true;
        // 具体的遍历 observeList 进行检测的过程
        for (let i = 0; i < observeList.length; i++) {
            const task = observeList[i];
            await task.checkOnlineForDownload();
        }
        // 还原 isRunning
        isRunning = false;
    }, 10000);
};

class ObserverTask {
    /**
     *
     * @param {房间信息} roomInfo
     * @param {间隔检测时间} timeout
     */
    constructor(roomInfo, timeout = 60) {
        this.roomInfo = roomInfo;
        this.timeout = timeout;
        this.lastTime = 0;
        this.checkOnlineForDownload();
    }

    checkNeedCheck() {
        console.log(`${this.roomInfo.owner} checkNeedCheck`);
        const now = Date.now();
        return now - this.lastTime > this.timeout * 1000;
    }

    checkIsDownloading() {
        console.log(`${this.roomInfo.owner} checkIsDownloading`);
        return isDownloading(this.roomInfo.webRoomId);
    }

    async checkIsOnline() {
        console.log(`${this.roomInfo.owner} checkIsOnline`);
        const ret = await anysisFromLink(this.roomInfo.liveLink);
        if (ret.isOnline) {
            addRoom(ret);
            this.roomInfo = ret;
            return true;
        }
        return false;
    }

    async checkOnlineForDownload() {
        // 判断是否要检测
        if (!this.checkNeedCheck()) return;
        // 记录当前时间
        this.lastTime = Date.now();
        // 是否正在下载
        if (this.checkIsDownloading()) return;
        // 是否在线
        if (await this.checkIsOnline()) {
            // 在线的话 开启下载
            console.log(`${this.roomInfo.owner} 开始下载`);
            addDownloadTaskByWebRoomId(this.roomInfo.webRoomId);
        }
    }
}

initInterval();

export const addObserverRoom = (webRoomId) => {
    const length = observeList.length;
    if (length >= maxObserveLength) {
        throw new Error('监听数已经到最大，请清理一下再添加');
    }
    const roomInfo = selectRoomById(webRoomId);
    observeList.push(new ObserverTask(roomInfo));
};

export const removeObserverRoom = (webRoomId) => {
    for (let i = 0; i < observeList.length; i++) {
        const roomIn = observeList[i].roomInfo;
        if (roomIn.webRoomId === webRoomId) {
            observeList.splice(i, 1);
            break;
        }
    }
};

export const getAllObserverTask = () => {
    const roomInfoList = observeList.map((task) => task.roomInfo);
    return roomInfoList;
};

registHandle(HandleEvents.ADD_OBSERVER_DOWNLOAD_TASK, addObserverRoom);
registHandle(HandleEvents.REMOVE_OBSERVER_DOWNLOAD_TASK, removeObserverRoom);
registHandle(HandleEvents.GET_OBSERVER_DOWNLOAD_TASK, getAllObserverTask);
