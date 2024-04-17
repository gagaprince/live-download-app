import { Event, HandleEvents } from '@/common/eventConst';

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

export const invokeTest = async () => {
    const ret = await ipcRenderer.invoke(HandleEvents.TEST, 'test');
    console.log('invokeTest ret:', ret);
};

export const getWorkspace = async () => {
    const ret = await ipcRenderer.invoke(HandleEvents.GET_WORKSPACE);
    return ret;
};

export const setWorkspace = async (path) => await ipcRenderer.invoke(HandleEvents.SET_WORKSPACE, path);

export const searchRoomInfos = async (opt) => await ipcRenderer.invoke(HandleEvents.SEARCH_ROOM_INFOS, opt);
export const anysisRoomInfo = async (link) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO, link);
export const addRoom = async (roomInfo) => await ipcRenderer.invoke(HandleEvents.ADD_ROOM, roomInfo);
export const openLink = async (link) => await ipcRenderer.invoke(HandleEvents.OPEN_LINK_EXPORT, link);
export const deleteRoom = async (webRoomId) => await ipcRenderer.invoke(HandleEvents.DELETE_ROOM, webRoomId);
export const addDownloadTask = async (webRoomId) => await ipcRenderer.invoke(HandleEvents.ADD_DOWNLOAD_TASK, webRoomId);
export const selectDirectory = async () => await ipcRenderer.invoke(HandleEvents.SELECT_DIR);
export const openDirectory = async (dir) => await ipcRenderer.invoke(HandleEvents.OPEN_DIR, dir);

export const getDownloadTaskList = async () => await ipcRenderer.invoke(HandleEvents.GET_DOWNLOADING_TASKLIST);
export const stopDownloadTask = async (webRoomId) => await ipcRenderer.invoke(HandleEvents.STOP_DOWNLOADING_TASK, webRoomId);

export const getSaveFileList = async () => await ipcRenderer.invoke(HandleEvents.GET_SAVE_FILE_LIST);
export const reCheckFileList = async () => await ipcRenderer.invoke(HandleEvents.RECHECK_SAVE_FILE_LIST);

export const addObserverDownload = async (webRoomId) => await ipcRenderer.invoke(HandleEvents.ADD_OBSERVER_DOWNLOAD_TASK, webRoomId);
export const removeObserverDownload = async (webRoomId) => await ipcRenderer.invoke(HandleEvents.REMOVE_OBSERVER_DOWNLOAD_TASK, webRoomId);
export const getAllObserverDownloadTask = async () => await ipcRenderer.invoke(HandleEvents.GET_OBSERVER_DOWNLOAD_TASK);
export const getttwid = async () => await ipcRenderer.invoke(HandleEvents.GET_TTWID);
export const getRealLink = async (origin) => await ipcRenderer.invoke(HandleEvents.GET_REALLINK, origin);
export const anysisRoomInfoFromLink = async (origin) => await ipcRenderer.invoke(HandleEvents.ANYSIS_ROOM_INFO_FROM_CENTER, origin);
