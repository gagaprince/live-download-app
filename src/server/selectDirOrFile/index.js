import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

const { dialog, shell } = require('electron');


export const selectDir = async () => dialog.showOpenDialog({
    properties: ['openDirectory'],
}).catch((err) => {
    console.log(err);
    return {};
});

export const openDir = async (dir) => shell.openPath(dir)
    .then(() => {
        console.log('Directory opened');
        return true;
    })
    .catch((err) => {
        console.error(err);
        return false;
    });

registHandle(HandleEvents.SELECT_DIR, selectDir);
registHandle(HandleEvents.OPEN_DIR, openDir);
