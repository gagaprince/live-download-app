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
