import { addDownloadTask, getDownloadTaskList, stopDownloadTask } from './downloadTaskManager';
import { selectRoomById } from '../room/selectRoom';
import { getSaveFileList, check } from './saveFile';

import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

export const addDownloadTaskByWebRoomId = (webRoomId) => {
    const roomInfo = selectRoomById(webRoomId);
    if (roomInfo) {
        addDownloadTask(roomInfo);
    }
};

registHandle(HandleEvents.ADD_DOWNLOAD_TASK, addDownloadTaskByWebRoomId);
registHandle(HandleEvents.GET_DOWNLOADING_TASKLIST, getDownloadTaskList);
registHandle(HandleEvents.STOP_DOWNLOADING_TASK, stopDownloadTask);
registHandle(HandleEvents.GET_SAVE_FILE_LIST, getSaveFileList);
registHandle(HandleEvents.RECHECK_SAVE_FILE_LIST, check);
