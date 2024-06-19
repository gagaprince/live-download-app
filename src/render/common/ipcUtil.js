import {
    Event, HandleEvents, RenderReceiveEvents,
} from '@/common/eventConst';

import ipcMethods from './ipcMethods';

const { ipcRenderer } = window;

const _createReplyPromise = () => {
    const replyHolder = {};
    replyHolder.reply = new Promise((resolve) => {
        replyHolder.resolveFun = resolve;
    });
    return replyHolder;
};

const sendFactory = (eventName) => {
    let replyHolder = _createReplyPromise();
    ipcRenderer.on(eventName, (event, arg) => {
        replyHolder.resolveFun(arg);
        replyHolder = _createReplyPromise();
    });
    return (options) => {
        ipcRenderer.send(eventName, options);
        return replyHolder.reply;
    };
};

const helloSend = sendFactory(Event.TEST);

export const sayHello = () => helloSend('hello');

/**
 * arg: {
 *  methodName, msgId, args
 * }
 */
const initCallRenderMethod = () => {
    ipcRenderer.on(RenderReceiveEvents.PING, async (event, arg) => {
        const { methodName, msgId, args } = arg;
        if (ipcMethods[methodName]) {
            const ret = await ipcMethods[methodName](...args);
            ipcRenderer.send(RenderReceiveEvents.PONG, {
                msgId, ret,
            });
        } else {
            ipcRenderer.send(RenderReceiveEvents.PONG, {
                msgId, error: `method:${methodName} is not defined`, ret: undefined,
            });
        }
    });
};

initCallRenderMethod();


export const invokeTest = async () => {
    const ret = await ipcRenderer.invoke(HandleEvents.TEST, 'test');
    console.log('invokeTest ret:', ret);
};

export const getWorkspace = async () => {
    const ret = await ipcRenderer.invoke(HandleEvents.GET_WORKSPACE);
    return ret;
};

export const setWorkspace = async (path) => await ipcRenderer.invoke(HandleEvents.SET_WORKSPACE, path);


export const getVideoWorkspace = async () => await ipcRenderer.invoke(HandleEvents.GET_VIDEO_WORKSPACE);
export const setVideoWorkspace = async (path) => await ipcRenderer.invoke(HandleEvents.SET_VIDEO_WORKSPACE, path);

export const searchRoomInfos = async (opt) => await ipcRenderer.invoke(HandleEvents.SEARCH_ROOM_INFOS, opt);
export const anysisRoomInfo = async (link) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO, link);
export const addRoom = async (roomInfo) => await ipcRenderer.invoke(HandleEvents.ADD_ROOM, roomInfo);
export const openLink = async (link) => await ipcRenderer.invoke(HandleEvents.OPEN_LINK_EXPORT, link);
export const deleteRoom = async (secUserId) => await ipcRenderer.invoke(HandleEvents.DELETE_ROOM, secUserId);
export const addDownloadTask = async (secUserId) => await ipcRenderer.invoke(HandleEvents.ADD_DOWNLOAD_TASK_BY_USERID, secUserId);
export const selectDirectory = async () => await ipcRenderer.invoke(HandleEvents.SELECT_DIR);
export const openDirectory = async (dir) => await ipcRenderer.invoke(HandleEvents.OPEN_DIR, dir);

export const getDownloadTaskList = async () => await ipcRenderer.invoke(HandleEvents.GET_DOWNLOADING_TASKLIST);
export const stopDownloadTask = async (secUserId) => await ipcRenderer.invoke(HandleEvents.STOP_DOWNLOADING_TASK, secUserId);

export const getSaveFileList = async () => await ipcRenderer.invoke(HandleEvents.GET_SAVE_FILE_LIST);
export const reCheckFileList = async () => await ipcRenderer.invoke(HandleEvents.RECHECK_SAVE_FILE_LIST);

export const addObserverDownload = async (secUserId, type) => await ipcRenderer.invoke(HandleEvents.ADD_OBSERVER_DOWNLOAD_TASK, secUserId, type);
export const removeObserverDownload = async (secUserId) => await ipcRenderer.invoke(HandleEvents.REMOVE_OBSERVER_DOWNLOAD_TASK, secUserId);
export const getAllObserverDownloadTask = async () => await ipcRenderer.invoke(HandleEvents.GET_OBSERVER_DOWNLOAD_TASK);
export const getttwid = async () => await ipcRenderer.invoke(HandleEvents.GET_TTWID);
export const getRealLink = async (origin) => await ipcRenderer.invoke(HandleEvents.GET_REALLINK, origin);
export const anysisRoomInfoFromLink = async (origin) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO_FROM_CENTER, origin);
export const anysisRoomInfoBySecUserId = async (secUid) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO_BY_SECID, secUid);
export const anysisRoomInfoByRoomId = async (roomId) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO_BY_ROOMID, roomId);
export const editRoomTypeByUserId = async (roomType, secUserId) => await ipcRenderer.invoke(HandleEvents.EDIT_ROOM_TYPE, roomType, secUserId);

export const getVideoInfoByLink = async (link) => await ipcRenderer.invoke(HandleEvents.GET_VIDEO_INFO, link);
export const downloadSmallVideoByLink = async (link, options) => await ipcRenderer.invoke(HandleEvents.DOWNLOAD_SMALL_VIDEO, link, options);

export const openDevTool = async () => await ipcRenderer.invoke(HandleEvents.OPEN_DEV_TOOLS);

export const clearCookie = async () => await ipcRenderer.invoke(HandleEvents.CLEAR_COOKIE);
