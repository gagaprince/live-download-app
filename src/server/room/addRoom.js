import axios from 'axios';
import { getRoomInfos, saveRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';

/**
 * roomInfo:{
 *  roomId,
 *  owner,
 *  avatar,
 *  liveLink,
 *  flvLink,
 * }
 * @param {} link
 * @returns
 */


export const anysisFromLink = async (link) => {
    // 需要返回roomInfo
    console.log('要分析的链接： ', link);
    let ret;
    try {
        ret = await axios.post('https://vd.gagaprince.top/smallvideo/douyinLive', {
            url: link,
        });

        const { status } = ret;
        if (status === 200) {
            const roomInfo = ret.data.data;
            //   console.log(roomInfo);
            if (roomInfo) {
                const roomId = '';
                const owner = roomInfo.owner.nickname;
                const avatar = roomInfo.owner.avatar_thumb.url_list[0];
                const liveLink = link;
                const flvLink = roomInfo.flv;
                return {
                    roomId,
                    owner,
                    avatar,
                    liveLink,
                    flvLink,
                };
            }
        }
    } catch (e) {
        console.error(e);
        return null;
    }
    return ret;
};


export const addRoom = (roomInfo) => {
    const roomInfos = getRoomInfos();
    roomInfos.push(roomInfo);
    saveRoomInfos(roomInfos);
};

registHandle(HandleEvents.ADD_ROOM, addRoom);
registHandle(HandleEvents.ANYSIS_ROOM_INFO, anysisFromLink);
