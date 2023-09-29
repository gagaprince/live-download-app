import { getRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

export const selectRoomById = (webRoomId) => {
    const roomInfoList = getRoomInfos();
    return roomInfoList.find((r) => r.webRoomId === webRoomId);
};

export const selectRoomInfo = (formOptions) => {
    const roomInfoList = getRoomInfos();
    const retList = roomInfoList.filter((roomInfo) => !!roomInfo.roomId);
    console.log('selectRoomInfo:', roomInfoList);
    if (formOptions) {
    // 有查询项 对数据做过滤
        // retList = roomInfoList.filter((roomInfo) => !roomInfo.roomId);
    }
    return retList;
};

registHandle(HandleEvents.SEARCH_ROOM_INFOS, selectRoomInfo);
