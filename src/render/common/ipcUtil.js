import { Event, HandleEvents } from '@/common/eventConst';
const ipcRenderer = window.ipcRenderer;

const _createReplyPromise = () => {
    const replyHolder = {};
    replyHolder.reply = new Promise((resolve)=>{
        replyHolder.resolveFun = resolve;
    })
    return replyHolder
}

const sendFactory = (eventName) => {
    let replyHolder = _createReplyPromise();
    ipcRenderer.on(eventName, (event, arg) => {
        replyHolder.resolveFun(arg);
        replyHolder = _createReplyPromise();
    })
    return (options) => {
        ipcRenderer.send(eventName, options);
        return replyHolder.reply;
    };
}

const helloSend = sendFactory(Event.TEST)

export const sayHello = ()=>{
    return helloSend('hello');
}

export const invokeTest = async ()=>{
    const ret = await ipcRenderer.invoke(HandleEvents.TEST, 'test');
    console.log('invokeTest ret:',ret);
};
