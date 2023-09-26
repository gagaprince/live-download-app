import { getRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

export const selectRoomInfo = (formOptions) => {
    const roomInfoList = getRoomInfos();
    if (formOptions){
        // 有查询项 对数据做过滤
        
    }
    return roomInfoList;
}

registHandle(HandleEvents.SEARCH_ROOM_INFOS, selectRoomInfo);
