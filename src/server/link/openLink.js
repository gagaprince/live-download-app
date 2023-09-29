import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

const { shell } = require('electron');

// 浏览器中打开链接
export const openLinkInExplorer = (link) => {
    console.log('openLinkInExplorer:', link);
    shell.openExternal(link);
    return true;
};

registHandle(HandleEvents.OPEN_LINK_EXPORT, openLinkInExplorer);
