
import { request } from '../request';
import { dySign } from './X-Bogus';
// import { xbogusSign } from '@/server/ipc';s


let ttwidCache = '';
let ttwidPromise;

(function initTtwidTimer() {
    setInterval(() => {
        ttwidCache = '';
    }, 1000 * 60 * 10);
}());

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
    if (ttwidPromise) {
        await ttwidPromise;
    }
    if (!ttwidCache || force) {
        try {
            ttwidPromise = request({
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
            const ret = await ttwidPromise;
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

const getVerifyData = async () => {
    // const ttwid = await getttwid();
    const ttwid = '1%7CUEW7jSuqWGrrzB2zSab7jZTxXXXK-lLCGcHZz6CvlpA%7C1715326035%7C399bf221f94e75db54a7f323db30702071378b7d3688954f9ebc0299325c5bb7';
    // const msToken = getMsToken();
    const headers = {
        // Host: 'www.douyin.com',
        Cookie: `ttwid=${ttwid};`,
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
        // referer: 'https://www.douyin.com/',
    };
    const url = 'https://www.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=7298173710010305833&update_version_code=170400&pc_client_type=1&version_code=190500&version_name=19.5.0&cookie_enabled=true&screen_width=1728&screen_height=1117&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=124.0.0.0&browser_online=true&engine_name=Blink&engine_version=124.0.0.0&os_name=Mac+OS&os_version=10.15.7&cpu_core_num=12&device_memory=8&platform=PC&downlink=4.4&effective_type=4g&round_trip_time=100&webid=7367269136412444175&msToken=VHRNonbHhjeFLxPA3ZxmYDbJkdnFW2zSxXeNGSWmVQxa3PEivm0BO7R28WqO4aXxtFmsacwJBopLQIhX8SENig4tDP7SWTw1vFY4PKQKGwkGv2jshz3rV6mgjOAPLA%3D%3D&a_bogus=Qf8hQ50hdDVN6D665AILfY3q65P3YpjR0trEMD2fWdVps639HMOH9exotNkva3RjLG%2FlIebjy4hbT3PMx5CrA3vIHuEKUIcMmDSkKl1kso0j53inCg6DE0hN4ku3SFqmRXNAEcXQy72GzuRmWoNe-7qvPE9jLojAYim7eprC';
    console.log('headers:', headers);
    console.log('url:', url);
    const ret = await request({
        url,
        headers,
    });
    console.log(ret);
    if (ret) {
        const resHeaders = ret.headers;
        return resHeaders['bdturing-verify'] || '';
    }
    return '';
};

export const getVideoInfoByAwemeId = async (awemeId, options) => {
    const { fp } = options;
    const ttwid = await getttwid();
    const msToken = getMsToken();
    let cookie = `msToken=${msToken};ttwid=${ttwid};`;
    if (fp) {
        cookie = `${cookie}s_v_web_id=${fp};`;
    }
    const headers = {
        Host: 'www.douyin.com',
        Cookie: cookie,
        accept: '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
        referer: 'https://www.douyin.com/',
    };
    const url = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`;

    try {
        const bogusObj = await dySign(url, headers['user-agent']);
        const newUrl = bogusObj.url;
        console.log('newUrl:', newUrl);
        const ret = await request({
            url: newUrl,
            headers,
        });
        if (ret) {
            // 检查responseheader 如果包含 Bdturing-Verify 则需要触发验证
            const resHeaders = ret.headers;
            // console.log(resHeaders);
            if (resHeaders['bdturing-verify']) {
                // 这里说明被风控了
                const verifyDataObj = await getVerifyData();
                const verifyJson = JSON.parse(verifyDataObj);
                const fpget = verifyJson.fp;
                const verifyData = encodeURIComponent(verifyDataObj);
                const verifyUrl = `https://rmc.bytedance.com/verifycenter/captcha/v2?from=iframe&fp=${fpget}&env=%7B%22screen%22%3A%7B%22w%22%3A1728%2C%22h%22%3A1117%7D%2C%22browser%22%3A%7B%22w%22%3A1728%2C%22h%22%3A1080%7D%2C%22page%22%3A%7B%22w%22%3A150%2C%22h%22%3A993%7D%2C%22document%22%3A%7B%22width%22%3A150%7D%2C%22product_host%22%3A%22www.douyin.com%22%2C%22vc_version%22%3A%221.0.0.60%22%2C%22maskTime%22%3A1715325442315%2C%22h5_check_version%22%3A%223.8.6%22%7D&aid=6383&host=%2F%2Fverify.zijieapi.com%2F&verify_data=${verifyData}`;
                return {
                    code: 123,
                    data: {
                        verifyUrl,
                        fp: fpget,
                    },
                    message: '需要验证',
                };
            } else {
                return ret.data;
            }
        }
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
