import { isDownloading } from '../download/downloadTaskManager';
import { addDownloadTaskByUserId } from '../download/index';
import { anysisRoomInfoBySecUserId, addRoom } from './addRoom';
import { selectRoomByUserId } from './selectRoom';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';
import { saveObservRoomInfos, getObservRoomInfos } from '@/server/configUtil';

const observeList = [];
let observeRoomList = [];
const maxObserveLength = 100;

const initInterval = () => {
    let isRunning = false;
    setInterval(async () => {
        try {
            if (isRunning) return;
            isRunning = true;
            // 具体的遍历 observeList 进行检测的过程
            for (let i = 0; i < observeList.length; i++) {
                const task = observeList[i];
                await task.checkOnlineForDownload();
            }
            // 还原 isRunning
            isRunning = false;
        } catch (e) {
            console.error(e);
        }
    }, 10000);
};

class ObserverTask {
    /**
     *
     * @param {房间信息} roomInfo
     * @param {间隔检测时间} timeout
     */
    constructor(roomInfo, timeout = 300) {
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
        return isDownloading(this.roomInfo.secUserId);
    }

    async checkIsOnline() {
        console.log(`${this.roomInfo.owner} checkIsOnline`);
        const ret = await anysisRoomInfoBySecUserId(this.roomInfo.secUserId);
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
            addDownloadTaskByUserId(this.roomInfo.secUserId);
        }
    }
}

export const removeObserverRoom = (secUserId) => {
    for (let i = 0; i < observeList.length; i++) {
        const roomIn = observeList[i].roomInfo;
        if (roomIn.secUserId === secUserId) {
            observeList.splice(i, 1);
            break;
        }
    }
    for (let i = 0; i < observeRoomList.length; i++) {
        const roomIn = observeRoomList[i];
        if (roomIn.secUserId === secUserId) {
            observeRoomList.splice(i, 1);
            saveObservRoomInfos(observeRoomList);
            break;
        }
    }
};

export const addObserverRoom = (secUserId, isInit) => {
    const length = observeList.length;
    if (length >= maxObserveLength) {
        throw new Error('监听数已经到最大，请清理一下再添加');
    }
    // console.log('addObserverRoom secUserId')
    const roomInfo = selectRoomByUserId(secUserId);
    if (roomInfo) {
        const ret = observeList.find((task) => task.roomInfo.secUserId === secUserId);
        if (!ret) {
            observeList.push(new ObserverTask(roomInfo));
            if (!isInit) {
                observeRoomList.push(roomInfo);
                saveObservRoomInfos(observeRoomList);
            }
        } else {
            console.log('重复了 不要重复监听');
        }
    } else {
        // 说明 secUserId 不在全局列表中 需要删除
        removeObserverRoom(secUserId);
    }
};


export const getAllObserverTask = () => {
    const roomInfoList = observeList.map((task) => task.roomInfo);
    return roomInfoList;
};

export const initObserverRoom = () => {
    observeRoomList = getObservRoomInfos();
    for (let i = 0; i < observeRoomList.length; i++) {
        const roomIn = observeRoomList[i];
        addObserverRoom(roomIn.secUserId, true);
    }
    initInterval();
};

registHandle(HandleEvents.ADD_OBSERVER_DOWNLOAD_TASK, addObserverRoom);
registHandle(HandleEvents.REMOVE_OBSERVER_DOWNLOAD_TASK, removeObserverRoom);
registHandle(HandleEvents.GET_OBSERVER_DOWNLOAD_TASK, getAllObserverTask);
