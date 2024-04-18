import { addDownloadTask, getDownloadTaskList, stopDownloadTask } from './downloadTaskManager';
import { selectRoomByUserId } from '../room/selectRoom';
import { getSaveFileList, check } from './saveFile';

import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';


export const addDownloadTaskByUserId = (secUserId) => {
    const roomInfo = selectRoomByUserId(secUserId);

    if (roomInfo) {
        addDownloadTask(roomInfo);
    }
};


registHandle(HandleEvents.ADD_DOWNLOAD_TASK_BY_USERID, addDownloadTaskByUserId);
registHandle(HandleEvents.GET_DOWNLOADING_TASKLIST, getDownloadTaskList);
registHandle(HandleEvents.STOP_DOWNLOADING_TASK, stopDownloadTask);
registHandle(HandleEvents.GET_SAVE_FILE_LIST, getSaveFileList);
registHandle(HandleEvents.RECHECK_SAVE_FILE_LIST, check);
