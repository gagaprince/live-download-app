import { getRoomInfos, saveRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

export const anysisRoom = (roomId) => {
    console.log('roomId: ' + roomId);
    // 发请求 获取房间信息
 }

export const addRoom = (roomInfo) => {
    const roomInfos = getRoomInfos();
    roomInfos.push(roomInfo);
    saveRoomInfos(roomInfos);
}

registHandle(HandleEvents.ADD_ROOM, addRoom)