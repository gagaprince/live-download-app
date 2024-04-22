/* eslint-disable no-useless-escape */
import { request } from '../request';

// function generateRandomStr(randomLength = 107) {
//     let randomStr = '';
//     const baseStr = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789=';
//     const length = baseStr.length - 1;
//     for (let i = 0; i < randomLength; i++) {
//         randomStr += baseStr[Math.floor(Math.random() * length)];
//     }
//     return randomStr;
// }

// function getMsToken() {
//     return generateRandomStr(107);
// }

// export const sign = (url, user_agent) => {
//     console.log(url, user_agent);
//     return new Promise((res, rej) => {
//         MarkerUtilNativeModule.sign({
//             url,
//             user_agent,
//         }, (ret) => {
//             if (ret && ret.data) {
//                 res(ret.data);
//             } else {
//                 rej('未知错误');
//             }
//         });
//     });
// };


// function parseCookieObj(cookie) {
//     console.log(cookie);
//     const keys = ['tt_chain_token', 'msToken', 'ttwid']; // 这里是你要获取的 cookie 的 key
//     const cookies = {};

//     for (let i = 0; i < keys.length; i++) {
//         const regex = new RegExp(`${keys[i]}=(.*?);`, 'g'); // 使用正则表达式匹配
//         const match = regex.exec(cookie);
//         if (match) {
//             const value = match[1].trim();
//             cookies[keys[i]] = value;
//         }
//     }
//     return cookies;
// }


export const getRealLink = async (link) => {
    console.log('getRealLink:', link);
    try {
        const ret = await request({
            url: link,
            responseType: 'text',
            followRedirects: 0,
            headers: {
                Host: 'www.tiktok.com',
                pragma: 'no-cache',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
        });
        const headers = ret.headers || {};
        const location = headers.Location || '';
        return location;
    } catch (e) {
        console.error(e);
    }
    return '';
};

// export const getVideoIdFromRealLink = (realLink) => {
//     const regex = /video\/(\d+)/; // 使用正则表达式匹配
//     const match = regex.exec(realLink);
//     let videoId;
//     if (match) {
//         videoId = match[1];
//     }
//     return videoId;
// };

// export const getCookieObj = async (link, force = false) => {
//     let cookies = {};
//     try {
//         const ret = await request({
//             url: link,
//             responseType: 'text',
//             headers: {
//                 Host: 'www.tiktok.com',
//                 accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
//                 'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
//             },
//         });
//         const headers = ret.headers || {};
//         const setCookie = headers['Set-Cookie'] || '';
//         cookies = parseCookieObj(setCookie);
//         console.log('getCookieObj:', cookies);
//     } catch (e) {
//         console.error(e);
//     }

//     return cookies;
// };

// export const getVideoInfoByVideoIdAndCookie = async (videoId, cookieObj = {}, realLink = '') => {
//     const msToken = cookieObj.msToken || getMsToken();
//     const tt_chain_token = cookieObj.tt_chain_token || '';
//     const headers = {
//         Host: 'www.tiktok.com',
//         // "Cookie": `tt_chain_token=${tt_chain_token}; msToken=${msToken};`,
//         Cookie: 'tt_csrf_token=sqk8FnLb-ri5ZAN1T2WRGybf6qTO8xsESAGg; tt_chain_token=vtFrm7Kuwk4JZFeFFrgkMg==; ak_bmsc=7330C612CBBAC624F494C5FA39F6B0BB~000000000000000000000000000000~YAAQkszVF4NcVz2OAQAAaU9lmRfR2ickzPh2A0QtkyCIk0+IcpgzDLu7jquRBLlTCeDOB2los6jLrQwmxSx6WzJt5+7PCGnPriPUZgboIYFzopQYVayJQ8UmlKrdu/04EKHYkYHMuleqNiMtyDDBfVnayBoHMFSJ2fraRhi3jmGpnm/jWtWZxLN5Ab2cj/X9B/SNHCMl0hYvyYodRztBO8g5yPPHsbGOOPAUz99P/+tAdSKBSnVwB3OWmyT9ziN/59N8YomQgp2QvtFfA9A0Ww0QdyKoRG9gKdbCBignMZP7dayzpxehrg+QbWbcPLMjuk/PknfH4kLkjcZ54R5YdV8gRKEPLQH702Q+VQNBJpycsDM75PKk3G+dl90bcWtSR9KRxXo5T7nTf78=; s_v_web_id=verify_lugv2168_n397NtHt_g1S2_4PVV_8s11_kcbiPplXK2tU; ttwid=1%7CYTLhelwnsAU94j93cQX4Oqs6y0p2xyv-li392diGt3s%7C1711971108%7C430fa1767196931e263896d87abc03901f5c803790b3b36ef92d20a5166b9e16; msToken=nQMSUWPg8OcbX4XgbhScMxBTyuBmb0GsVIStsxXmyWyvyta3kkUdj1_P4OJRXzPW2K-fEL2_0qPJlkZArSJkGCHpMxjKPZ9WyPbSbYeM5FbZVFTsDmHW; msToken=-kEv4GBWtOI5u0Sidt4GmNT9YlIGl1Abl8WwpecI0BO6CTs7j9aKYXCVpDxgXATxAABCMA6RpFhGU5uplnhmqpbncXJHo0N3JE2Wnh3LmhSZPr1Q-0UScIS83qwxwctAAVSfhHKLB5BPX9Zdvo6-; bm_sv=3951BE4F0BDEC11EEB0508B28B3E4F33~YAAQkszVF89iVz2OAQAA8GNumRdBTwkq12e+P7Mshc/tuvacKFZRKFzUpFqKrq3mldb/0kL9A+0SSraxUfk3Ilz8Jj7H+ncyHJAC3hmMe/ew+iUA5bk3XhbavPgF8ZKyzx7xiWdtmxbuDDiZFcXgq9cB9EL6Xq5zyOjWAs9sbql0KVER4tfhMXIcB1b++/eicd/GG5k7fjfqoo4ipBheIHOID5cfIXnGSc6d5e5bq55GP/6MwIVT644ru/RDzbgk~1',
//         accept: '*/*',
//         'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
//         'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
//         referer: realLink,
//     };
//     const url = 'https://www.tiktok.com/api/item/detail/?aid=1988&app_id=1180&app_language=zh-Hans&app_name=tiktok_web&browser_language=zh-CN&browser_name=Mozilla&browser_online=true&browser_platform=MacIntel&browser_version=5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_6%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Version%2F16.6%20Mobile%2F15E148%20Safari%2F604.1&channel=tiktok_web&clientABVersions=70508271&clientABVersions=71861571&clientABVersions=71916113&clientABVersions=72040650&clientABVersions=72054588&clientABVersions=72072742&clientABVersions=72080023&clientABVersions=72096078&clientABVersions=72097168&clientABVersions=72098428&client_ab_versions=70508271&client_ab_versions=71861571&client_ab_versions=71916113&client_ab_versions=72040650&client_ab_versions=72054588&client_ab_versions=72072742&client_ab_versions=72080023&client_ab_versions=72096078&client_ab_versions=72097168&client_ab_versions=72098428&cookie_enabled=true&coverFormat=0&device_id=7352857379065218577&device_platform=web_mobile&focus_state=true&from_page=video&history_len=7&is_fullscreen=false&is_page_visible=true&itemId=7352366345708653854&item_id=7352366345708653854&language=zh-Hans&os=ios&priority_region=&referer=&region=KR&screen_height=844&screen_width=390&sourceType=33&traffic_type=0&tz_name=Asia%2FShanghai&uCode=&u_code=&user_info_type=1&verifyFp=verify_lugv2168_n397NtHt_g1S2_4PVV_8s11_kcbiPplXK2tU&web_id=7352857379065218577&webcast_language=zh-Hans&msToken=3nqpVwJ3iYRK6RCCK4PY1HvxnesphPSuqWHJ4X97kstl4R22V2W-F4DI0KH1oRi_paNy25qc4TFGzjfkxKR1zvGZE-15W9Z0Nh88zjptdZNMLf7-6DDAY3Nh5SV---zwEBJZrdoxCSG6Z_H2CVaH';

//     console.log('url:', url);

//     try {
//         const bogusObj = await sign(url, headers['user-agent']);

//         console.log('bogus:', bogusObj);

//         // const newUrl = `${url}&X-Bogus=${bogusObj['X-Bogus']}`;
//         const newUrl = 'https://www.tiktok.com/api/item/detail/?aid=1988&app_id=1180&app_language=zh-Hans&app_name=tiktok_web&browser_language=zh-CN&browser_name=Mozilla&browser_online=true&browser_platform=MacIntel&browser_version=5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_6%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Version%2F16.6%20Mobile%2F15E148%20Safari%2F604.1&channel=tiktok_web&clientABVersions=70508271&clientABVersions=71861571&clientABVersions=71916113&clientABVersions=72040650&clientABVersions=72054588&clientABVersions=72072742&clientABVersions=72080023&clientABVersions=72096078&clientABVersions=72097168&clientABVersions=72098428&client_ab_versions=70508271&client_ab_versions=71861571&client_ab_versions=71916113&client_ab_versions=72040650&client_ab_versions=72054588&client_ab_versions=72072742&client_ab_versions=72080023&client_ab_versions=72096078&client_ab_versions=72097168&client_ab_versions=72098428&cookie_enabled=true&coverFormat=0&device_id=7352857379065218577&device_platform=web_mobile&focus_state=true&from_page=video&history_len=7&is_fullscreen=false&is_page_visible=true&itemId=7352366345708653854&item_id=7352366345708653854&language=zh-Hans&os=ios&priority_region=&referer=&region=KR&screen_height=844&screen_width=390&sourceType=33&traffic_type=0&tz_name=Asia%2FShanghai&uCode=&u_code=&user_info_type=1&verifyFp=verify_lugv2168_n397NtHt_g1S2_4PVV_8s11_kcbiPplXK2tU&web_id=7352857379065218577&webcast_language=zh-Hans&msToken=3nqpVwJ3iYRK6RCCK4PY1HvxnesphPSuqWHJ4X97kstl4R22V2W-F4DI0KH1oRi_paNy25qc4TFGzjfkxKR1zvGZE-15W9Z0Nh88zjptdZNMLf7-6DDAY3Nh5SV---zwEBJZrdoxCSG6Z_H2CVaH&X-Bogus=DFSzswVOEtxAN9sPt-Gl6jLNKBOz';

//         console.log('newUrl:', newUrl);

//         const ret = await request({
//             url: newUrl,
//             headers,
//             responseType: 'text',
//         });

//         console.log(ret);

//         return ret && ret.data;
//     } catch (e) {
//         console.error(e);
//     }
// };

/**
 *
 * @param {*} html
 * {
 *  type: video|token
 *  data: videoInfo | tokenStr
 * }
 *
 */
function parseRetHtml(html) {
    // 是否拿到了信息
    const str = html;
    const match = str.match(/<source src=\"(.*?)\"/);
    const srcValue = match ? match[1] : null;

    if (srcValue) {
        return {
            type: 'video',
            data: {
                videoUrl: srcValue.indexOf('http') === 0 ? srcValue : `https:${srcValue}`,
            },
        };
    } else {
        // 没有拿到信息返回新token 重新返回token
        const tokenMatch = str.match(/id=\"token\" value=\"(.*?)\"/);
        const tokenVal = tokenMatch ? tokenMatch[1] : '';
        if (tokenVal) {
            return {
                type: 'token',
                data: tokenVal,
            };
        }
    }

    return null;
}
let tokenCache = 'G7eRpMaa'; // tokenCache
// dlpanda 网站解析
export const getVideoInfoFromDLpanda = async (link, token = '') => {
    const spiderLink = `https://dlpanda.com/zh-CN?url=${encodeURIComponent(link)}&token=${token || tokenCache}`;
    try {
        const ret = await request({
            url: spiderLink,
            responseType: 'text',
            headers: {
                Host: 'dlpanda.com',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
        });
        const html = ret.data;
        // console.log(html);
        const parseRet = parseRetHtml(html);
        if (parseRet) {
            if (parseRet.type === 'token' && parseRet.data !== token) {
                console.log('获取token重新请求:', parseRet.data);
                tokenCache = parseRet.data;
                return getVideoInfoFromDLpanda(link, parseRet.data);
            } else {
                if (parseRet.type === 'token') {
                    console.log('新token解析也失败，应该是链接有问题，停止解析');
                    return null;
                }
                console.log('解析出video信息:', parseRet.data);
                return parseRet.data;
            }
        }
        console.log('解析失败！');
        return null;
    } catch (e) {
        console.error(e);
    }
    return null;
};
