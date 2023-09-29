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
        // ret = await axios.post('https://vd.gagaprince.top/smallvideo/douyinLive', {
        ret = await axios.post('http://localhost:3000/smallvideo/douyinLive', {
            url: link,
        });

        const { status } = ret;
        if (status === 200) {
            const roomInfo = ret.data.data;
            console.log(roomInfo);
            if (roomInfo) {
                const roomId = roomInfo.roomId;
                const webRoomId = roomInfo.webRoomId;
                const roomTitle = roomInfo.roomTitle;
                const owner = roomInfo.owner.nickname;
                const avatar = roomInfo.owner.avatar_thumb.url_list[0];
                const liveLink = link;
                const flvLink = roomInfo.flv;
                return {
                    roomId,
                    webRoomId,
                    roomTitle,
                    owner,
                    avatar,
                    liveLink,
                    flvLink,
                    isOnline: !!flvLink,
                };
            }
        }
    } catch (e) {
        console.error(e);
        return {};
    }
    return ret;
};


export const addRoom = (roomInfo) => {
    if (!roomInfo || !roomInfo.roomId) {
        return false;
    }
    const roomInfos = getRoomInfos();
    // 此处需要查询当前房间信息中是否已经存在要存入的房间
    const roomIn = roomInfos.find((item) => item.webRoomId === roomInfo.webRoomId);
    console.log('roomin:', roomIn);
    if (roomIn) {
        Object.assign(roomIn, roomInfo);
    } else {
        roomInfos.push(roomInfo);
    }
    saveRoomInfos(roomInfos);
    return true;
};

export const deleteRoom = (webRoomId) => {
    if (!webRoomId) {
        return false;
    }
    const roomInfos = getRoomInfos();

    for (let i = roomInfos.length - 1; i >= 0; i--) {
        if (roomInfos[i].webRoomId === webRoomId) {
            roomInfos.splice(i, 1);
        }
    }

    saveRoomInfos(roomInfos);
    return true;
};

registHandle(HandleEvents.ADD_ROOM, addRoom);
registHandle(HandleEvents.ANYSIS_ROOM_INFO, anysisFromLink);
registHandle(HandleEvents.DELETE_ROOM, deleteRoom);
