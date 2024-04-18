
import { request } from '../request';
import { dySign } from './X-Bogus';
import { xbogusSign } from '@/server/ipc';


let ttwidCache = '';

function parseTtwidFromCookie(cookies) {
    console.log(cookies);
    let ttwid = '';
    cookies.forEach((cookie) => {
        const matcher = cookie.match(/ttwid=([^;]+)/);
        if (matcher) {
            ttwid = matcher[1];
        }
    });

    return ttwid;
}

function generateRandomStr(randomLength = 107) {
    let randomStr = '';
    const baseStr = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789=';
    const length = baseStr.length - 1;
    for (let i = 0; i < randomLength; i++) {
        randomStr += baseStr[Math.floor(Math.random() * length)];
    }
    return randomStr;
}

function getMsToken() {
    return generateRandomStr(107);
}

export const getttwid = async (force = false) => {
    if (!ttwidCache || force) {
        try {
            const ret = await request({
                url: 'https://ttwid.bytedance.com/ttwid/union/register/',
                method: 'POST',
                data: {
                    migrate_info: { ticket: '', source: 'node' }, region: 'cn', union: true, service: 'www.ixigua.com', aid: 1768, cbUrlProtocol: 'https', needFid: false,
                },
                headers: {
                    Host: 'ttwid.bytedance.com',
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'user-agent': 'CoolVidCut/1.2.1 (iPhone; iOS 15.4.1; Scale/2.00)',
                    'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
                },
            });
            const headers = ret.headers || {};
            const cookies = headers['set-cookie'] || '';
            ttwidCache = parseTtwidFromCookie(cookies);
            console.log('ttwidCache:', ttwidCache);
        } catch (e) {
            console.error(e);
        }
    }
    return ttwidCache;
};

export const getRealLink = async (link) => {
    console.log('origin：', link);
    try {
        const ret = await request({
            url: link,
            responseType: 'text',
            followRedirects: 0,
            headers: {
                Host: 'v.douyin.com',
                pragma: 'no-cache',
                accept: '*/*',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
            },
        });
        const headers = ret.headers || {};
        const location = headers.location || '';
        return location;
    } catch (e) {
        console.error(e);
    }
    return '';
};

export const getAwemeId = async (originLink) => {
    const relink = await getRealLink(originLink);
    if (relink) {
        const match = relink.match(/video\/(\d+)\//) || [];
        const awemeId = match[1] || '';
        return awemeId;
    }
    return '';
};


export const getVideoInfoByAwemeId = async (awemeId) => {
    const ttwid = await getttwid();
    const msToken = getMsToken();
    const headers = {
        Host: 'www.douyin.com',
        Cookie: `msToken=${msToken};ttwid=${ttwid};`,
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
        referer: 'https://www.douyin.com/',
    };
    const url = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`;

    try {
        const bogusObj = await xbogusSign(url, headers['user-agent']);

        console.log('bogus:', bogusObj);

        const newUrl = bogusObj.url;

        console.log('newUrl:', newUrl);

        const ret = await request({
            url: newUrl,
            headers,
        });

        console.log(ret);

        return ret && ret.data;
    } catch (e) {
        console.error(e);
    }
    return '';
};

export const getQueryString = (name, url) => {
    let u = url || window.location.search;
    const reg = new RegExp(`(^|&|\\?)${name}=([^&]*)(&|$)`);
    if (u.substr(0, 1) === '?') {
        u = u.substr(1);
    }
    const r = u.match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return '';
};

export const getRoomInfoFromPercenCenter = async (secUserId, count, maxCursor = 0) => {
    const ttwid = await getttwid();
    const msToken = getMsToken();
    const headers = {
        Host: 'www.douyin.com',
        Cookie: `msToken=${msToken};ttwid=${ttwid};`,
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
        referer: `https://www.douyin.com/user/${secUserId}`,
    };
    const url = `https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=${secUserId}&count=${count}&max_cursor=${maxCursor}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`;

    console.log('url:', url);
    try {
        const serverSignRet = await dySign(url, headers['user-agent']);

        const newUrl = serverSignRet.url;

        console.log('newUrl:', newUrl);

        const ret = await request({
            url: newUrl,
            headers,
            responseType: 'json',
        });
        // console.log('获取到结果--------');
        // console.log(ret);
        return ret && ret.data;
    } catch (e) {
        console.error(e);
    }
    return '';
};

export const getLiveRoomInfo = async (roomId) => {
    const headers = {
        Host: 'webcast.amemv.com',
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
    };
    const url = `https://webcast.amemv.com/webcast/room/reflow/info/?type_id=0&live_id=1&room_id=${roomId}&version_code=99.99.99&app_id=1128&msToken=`;

    console.log('url:', url);
    try {
        const serverSignRet = await dySign(url, headers['user-agent']);

        const newUrl = serverSignRet.url;

        console.log('newUrl:', newUrl);

        const ret = await request({
            url: newUrl,
            headers,
        });
        // console.log('获取到结果--------');
        // console.log(ret);
        return ret && ret.data;
    } catch (e) {
        console.error(e);
    }
    return '';
};
