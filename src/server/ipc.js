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
};

export const sign = async (options) => {
    mainWin.webContents.send(RenderReceiveEvents.SIGN, options);
};
