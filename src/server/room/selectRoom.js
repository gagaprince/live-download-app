import { getRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

export const selectRoomById = (webRoomId) => {
    const roomInfoList = getRoomInfos();
    return roomInfoList.find((r) => r.webRoomId === webRoomId);
};

export const selectRoomInfo = (formOptions) => {
    const roomInfoList = getRoomInfos() || [];
    let retList = roomInfoList.filter((roomInfo) => !!roomInfo.roomId).reverse();
    console.log('selectRoomInfo:', roomInfoList);
    console.log('formOptions:', formOptions);
    if (formOptions && (formOptions.roomId || formOptions.owner)) {
    // 有查询项 对数据做过滤
        retList = roomInfoList.filter((roomInfo) => {
            let roomIdMatch = false;
            let ownerMatch = false;
            if (formOptions.roomId) {
                roomIdMatch = (`${roomInfo.webRoomId}`).startsWith(formOptions.roomId);
            }
            if (formOptions.owner) {
                ownerMatch = (`${roomInfo.owner}`).indexOf(formOptions.owner) !== -1;
            }
            return roomIdMatch || ownerMatch;
        });
    }
    return retList;
};

registHandle(HandleEvents.SEARCH_ROOM_INFOS, selectRoomInfo);
