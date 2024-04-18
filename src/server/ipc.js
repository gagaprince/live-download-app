import { Event, HandleEvents, RenderReceiveEvents } from '@/common/eventConst';

const { ipcMain } = require('electron');

const controllerMap = {};

export const registController = (eventName, controller) => {
    controllerMap[eventName] = controller;
};

const handlerMap = {};

export const registHandle = (eventName, handler) => {
    handlerMap[eventName] = handler;
};

export const getMsgId = () => ('0'.repeat(8) + parseInt(Math.pow(2, 40) * Math.random(), 10).toString(32)).slice(-8) + Date.now();

const _createReplyPromise = () => {
    // 生成一个msgid
    const msgId = getMsgId();
    const replyHolder = {
        msgId,
    };
    replyHolder.reply = new Promise((resolve) => {
        replyHolder.resolveFun = resolve;
    });
    return replyHolder;
};


const renderReplyList = [];
const registRenderReply = (holder) => {
    renderReplyList.push(holder);
};

const invokeRenderReply = (arg) => {
    console.log(arg);
};

let mainWin;
export const initIpc = (win) => {
    mainWin = win;
    // 这种是异步调用 render 调用 main
    Object.keys(Event).forEach((key) => {
        ipcMain.on(Event[key], (event, arg) => {
            const controller = controllerMap[Event[key]];
            if (controller) {
                controller.reply(event, arg);
            } else {
                // 给一个默认的回复
                event.reply(Event[key], '当前事件没有找到对应的controller');
            }
        });
    });
    // 这种是同步调用 render 调用 main
    Object.keys(HandleEvents).forEach((key) => {
        console.log(HandleEvents[key]);
        ipcMain.handle(HandleEvents[key], (event, ...args) => {
            console.log('key:', key);
            const handler = handlerMap[HandleEvents[key]];
            if (handler) {
                if (handler.invoke) return handler.invoke(...args);
                return handler(...args);
            }
            // 给一个默认的调用结果
            console.log(args);
            return '当前事件没有找到对应的handler';
        });
    });

    ipcMain.on(RenderReceiveEvents.PONG, (event, arg) => {
        invokeRenderReply(arg);
    });
};

/**
 *
 * @param {*} options
 * {
 *  methodName: sign,
 *  args: args,
 *  msgId,
 * }
 * @returns
 */
export const invokeRenderMethod = (options) => {
    const holder = _createReplyPromise();
    const msg = {
        ...options,
        msgId: holder.msgId,
    };
    mainWin.webContents.send(RenderReceiveEvents.PING, msg);
    registRenderReply(holder);
    return holder.reply;
};

export const xbogusSign = async (url, agent) => {
    const ret = await invokeRenderMethod({
        methodName: 'xbogusSign',
        args: [url, agent],
    });
    console.log(ret);
};
