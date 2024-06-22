import { Event, HandleEvents, RenderReceiveEvents } from '@/common/eventConst';


const { URL } = require('url');

const { ipcMain, app } = require('electron');

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
    replyHolder.reply = new Promise((resolve, reject) => {
        replyHolder.resolveFun = resolve;
        replyHolder.rejectFun = reject;
    });
    return replyHolder;
};


let renderReplyList = [];
const registRenderReply = (holder) => {
    renderReplyList.push(holder);
};

const invokeRenderReply = (arg) => {
    const { msgId, ret, error } = arg;
    const holder = renderReplyList.find((ele) => ele.msgId === msgId);
    if (error) {
        holder.rejectFun(error);
    } else {
        holder.resolveFun(ret);
    }
    renderReplyList = renderReplyList.filter((ele) => ele.msgId !== msgId);
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

export const abogusSign = async (url, agent) => {
    const ret = await invokeRenderMethod({
        methodName: 'abogusSign',
        args: [url, agent],
    });
    console.log('abogusSign', ret);
    return ret;
};


// 监听网页逻辑
const verifyFpChanglist = [];
export const invokeVerifyLink = (link) => {
    // 获取verifyFp
    const url = new URL(link);
    // 使用URLSearchParams获取查询参数
    const params = new URLSearchParams(url.search);
    const verifyFp = params.get('fp');
    // 触发渲染层展示验证码
    invokeRenderMethod({
        methodName: 'renderVerifyLink',
        args: [link, verifyFp],
    });

    // 触发verifyFpChang事件
    verifyFpChanglist.forEach((lis) => {
        if (lis) {
            lis(verifyFp);
        }
    });
};


export const addVerifyFpChangeListener = (lis) => {
    verifyFpChanglist.push(lis);
};

let sessionCache;
export const initNetworkListener = (session) => {
    sessionCache = session;
    session.webRequest.onBeforeRequest({
        urls: [
            'https://www.douyin.com/video/*',
            'https://rmc.bytedance.com/verifycenter/*',
        ],
    }, (details, callback) => {
        console.log('URL:', details.url); // 打印获取到的URL
        if (details.url.indexOf('https://rmc.bytedance.com/') === 0) {
            invokeVerifyLink(details.url);
        }
        callback({ cancel: false });
    });
};

global.logRender = async (...args) => {
    await invokeRenderMethod({
        methodName: 'logRender',
        args: [...args],
    });
};

export const clearCookie = async () => {
    if (sessionCache) {
        await sessionCache.clearStorageData({
            storages: ['cookies'],
        });
    }
};


// 重启应用
export const relaunchApp = () => {
    app.relaunch();
    app.exit(0);
};

registHandle(HandleEvents.CLEAR_COOKIE, clearCookie);
registHandle(HandleEvents.RELAUNCH_APP, relaunchApp);
