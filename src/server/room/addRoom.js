import axios from 'axios';
import { getRoomInfos, saveRoomInfos } from '../configUtil';
import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';
import {
    getttwid, getRealLink, getQueryString, getRoomInfoFromPercenCenter, getLiveRoomInfo,
} from '../lib/dy/dyParser';

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
        // ret = await axios.post('http://localhost:3000/smallvideo/douyinLive', {
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

export const getFlvLinkAndTitleByRoomId = async (roomId) => {
    const roomDetailInfo = await getLiveRoomInfo(roomId);
    if (roomDetailInfo && roomDetailInfo.status_code === 0) {
        const { room } = roomDetailInfo.data;
        const title = room.title;
        const flvLinkObj = room.stream_url.flv_pull_url || {};
        const flvLink = flvLinkObj[Object.keys(flvLinkObj)[0]];
        return { title, flvLink };
    }
    return {};
};

// 这个方法获取的flv下载下来打不开
// 所以需要 再请求另一个接口
export const anysisRoomInfoBySecUserId = async (secUserId) => {
    const ret = await getRoomInfoFromPercenCenter(secUserId, 2) || {};

    if (ret.status_code === 0) {
        const owner = ret.aweme_list[0].author.nickname;
        let avatar = ret.aweme_list[0].author.avatar_thumb.url_list[0];
        if (avatar) {
            avatar = avatar.replace('.heic', '.jpeg');
        }
        const roomDataStr = ret.aweme_list[0].author.room_data;
        let isOnline = false;
        let flvLink = '';
        let roomData = {};
        let roomId = '';
        let roomTitle = '不重要，不获取了';
        try {
            if (roomDataStr) {
                isOnline = true;
                roomData = JSON.parse(roomDataStr);
                // console.log('roomData:', roomData);
                roomId = roomData.id_str;
                const roomRealInfo = await getFlvLinkAndTitleByRoomId(roomId);
                flvLink = roomRealInfo.flvLink;
                roomTitle = roomRealInfo.title;
                // const flvLinkObj = roomData.stream_url.flv_pull_url;
                // flvLink = flvLinkObj[Object.keys(flvLinkObj)[0]];
            }
        } catch (e) {
            console.error(e);
        }

        return {
            secUserId, owner, avatar, flvLink, isOnline, roomId, roomTitle,
        };
    }
    return null;
};

/**
 * @param {*} link 个人主页链接
 * @returns {
 *  secUserId,
 *  owner,
 *  avatar,
 *  homeLink,
 *  roomId,
 *  flvLink,
 *  isOnline,
 * }
 */
export const anysisRoomInfoFromLink = async (link) => {
    console.log('要分析的链接： ', link);
    const realLink = await getRealLink(link);
    console.log('实际链接:', realLink);
    const secUserId = getQueryString('sec_uid', realLink);
    const info = await anysisRoomInfoBySecUserId(secUserId);
    if (info) {
        return {
            ...info,
            hoomLink: link,
        };
    }
    return {};
};

export const updateRoomInfo = async (roomInfo) => {
    if (!roomInfo.secUserId) {
        console.log('oldroomInfo:', roomInfo);
        const newRoomInfo = await anysisFromLink(roomInfo.liveLink);
        roomInfo.roomId = newRoomInfo.roomId || roomInfo.roomId;
        // roomId 有可能变 所以需要先请求一下新的roomId
        const roomDetailInfo = await getLiveRoomInfo(roomInfo.roomId);
        if (roomDetailInfo && roomDetailInfo.status_code === 0) {
            const { room } = roomDetailInfo.data;
            const owner = room.owner;
            const secUid = owner.sec_uid;
            roomInfo.secUserId = secUid;
        }
        console.log('newRoomInfo:', roomInfo);
    }
    return roomInfo;
};

export const updateRoomInfos = async () => {
    const roomInfos = getRoomInfos();
    const len = roomInfos.length;
    for (let i = 0; i < len; i++) {
        await updateRoomInfo(roomInfos[i]);
    }
    saveRoomInfos(roomInfos);
};


export const addRoom = (roomInfo) => {
    if (!roomInfo || !roomInfo.secUserId) {
        return false;
    }
    const roomInfos = getRoomInfos();
    // 此处需要查询当前房间信息中是否已经存在要存入的房间
    const roomIn = roomInfos.find((item) => item.secUserId === roomInfo.secUserId);
    console.log('roomin:', roomIn);
    if (roomIn) {
        Object.assign(roomIn, roomInfo);
    } else {
        roomInfos.push(roomInfo);
    }
    saveRoomInfos(roomInfos);
    return true;
};

export const editRoomTypeByUserId = (roomType, secUserId) => {
    if (!roomType || !secUserId) {
        return false;
    }
    const roomInfos = getRoomInfos();
    // 此处需要查询当前房间信息中是否已经存在要存入的房间
    const roomIn = roomInfos.find((item) => item.secUserId === secUserId);
    console.log('roomin:', roomIn);
    if (roomIn) {
        roomIn.roomType = roomType;
    } else {
        return false;
    }
    saveRoomInfos(roomInfos);
    return true;
};

export const deleteRoom = (secUserId) => {
    console.log(secUserId);
    if (!secUserId) {
        return false;
    }
    const roomInfos = getRoomInfos();

    for (let i = roomInfos.length - 1; i >= 0; i--) {
        if (roomInfos[i].secUserId === secUserId) {
            roomInfos.splice(i, 1);
        }
    }

    saveRoomInfos(roomInfos);
    return true;
};

registHandle(HandleEvents.ADD_ROOM, addRoom);
registHandle(HandleEvents.ANYSIS_ROOM_INFO, anysisFromLink);
registHandle(HandleEvents.DELETE_ROOM, deleteRoom);
registHandle(HandleEvents.GET_TTWID, getttwid);
registHandle(HandleEvents.GET_REALLINK, getRealLink);
registHandle(HandleEvents.ANYSIS_ROOM_INFO_FROM_CENTER, anysisRoomInfoFromLink);
registHandle(HandleEvents.ANYSIS_ROOM_INFO_BY_SECID, anysisRoomInfoBySecUserId);
registHandle(HandleEvents.EDIT_ROOM_TYPE, editRoomTypeByUserId);
