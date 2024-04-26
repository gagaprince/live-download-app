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
        if (ret.aweme_list && ret.aweme_list.length) {
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
        } else {
            console.log('此人没有发作品，无法从个人主页查询直播信息');
        }
    }
    return null;
};

export const anysisRoomInfoByRoomId = async (roomId) => {
    const roomDetailInfo = await getLiveRoomInfo(roomId);
    if (roomDetailInfo && roomDetailInfo.status_code === 0) {
        const { room } = roomDetailInfo.data;
        let replaceRoomId = roomId;
        try {
            replaceRoomId = room.owner.own_room.room_ids_str[0];
        } catch (e) {
            console.error(e);
        }
        if ((`${roomId}`) !== (`${replaceRoomId}`)) {
            // 有roomId的切换 递归返回数据
            return await anysisRoomInfoByRoomId(replaceRoomId);
        }
        const roomTitle = room.title;
        const flvLinkObj = room.stream_url.flv_pull_url || {};
        const flvLink = flvLinkObj[Object.keys(flvLinkObj)[0]];
        const owner = room.owner.nickname || '';
        const secUserId = room.owner.sec_uid || '';
        const avatar = room.owner.avatar_medium.url_list[0] || '';
        console.log('anysisRoomInfoByRoomId status:', room.status);
        const isOnline = room.status === 2;
        return {
            roomTitle, flvLink, owner, secUserId, avatar, isOnline, roomId,
        };
    }
    return null;
};

function parseRoomId(link) {
    const match = link.match(/webcast\/reflow\/(\d+)/);
    return match ? match[1] : null;
}

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
 *  fromType, // 只有roomId方式的有 默认就是个人主页
 * }
 */
export const anysisRoomInfoFromLink = async (link) => {
    try {
        console.log('要分析的链接： ', link);
        const realLink = await getRealLink(link);
        console.log('实际链接:', realLink);
        // 这里根据 实际链接分析是个人主页还是直播链接
        if (realLink.indexOf('webcast.amemv.com') !== -1) {
            // 是直播链接
            // 分析roomId
            const roomId = parseRoomId(realLink);
            console.log('分析出roomId', roomId);
            if (roomId) {
                const info = await anysisRoomInfoByRoomId(roomId);
                if (info) {
                    return {
                        ...info,
                        fromType: 'roomId',
                        hoomLink: link,
                    };
                }
            }
        } else {
            // 是个人中心链接
            const secUserId = getQueryString('sec_uid', realLink);
            const info = await anysisRoomInfoBySecUserId(secUserId);
            if (info) {
                return {
                    ...info,
                    hoomLink: link,
                };
            }
        }
    } catch (e) {
        console.error(e);
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
registHandle(HandleEvents.ANYSIS_ROOM_INFO_BY_ROOMID, anysisRoomInfoByRoomId);
