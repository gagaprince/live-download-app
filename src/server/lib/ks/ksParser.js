/* eslint-disable no-useless-escape */
/* eslint-disable camelcase */
import { request } from '../request';
import { ksSign } from './ksSign';

export const getKsRealLink = async (link) => {
    try {
        const ret = await request({
            url: link,
            responseType: 'text',
            followRedirects: 0,
            headers: {
                Host: 'v.kuaishou.com',
                pragma: 'no-cache',
                cookie: '',
                accept: '*/*',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
            },
        });
        const headers = ret.headers || {};
        const location = headers.Location || headers.location || '';
        return location;
    } catch (e) {
        console.error(e);
    }
    return '';
};

function parseCookieObj(cookie) {
    const keys = ['did', 'didv']; // 这里是你要获取的 cookie 的 key
    const cookies = {};

    for (let i = 0; i < keys.length; i++) {
        const regex = new RegExp(`${keys[i]}=(.*?);`, 'g'); // 使用正则表达式匹配
        const match = regex.exec(cookie);
        if (match) {
            const value = match[1].trim();
            cookies[keys[i]] = value;
        }
    }
    return cookies;
}

export const parseCookieObjByLink = async (realLink) => {
    const domain = realLink.match(/https?:\/\/([^\/]+)/i)[1];
    let cookies = {};
    try {
        const ret = await request({
            url: realLink,
            responseType: 'text',
            headers: {
                Host: domain,
                cookie: '',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'accept-language': 'zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8',
            },
        });
        const headers = ret.headers || {};
        const setCookies = headers['Set-Cookie'] || '';
        cookies = parseCookieObj(setCookies);
    } catch (e) {
        console.error(e);
    }
    return cookies;
};

export const getQueryString = (name, url) => {
    let u = url || window.location.search;
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    if (u.substr(0, 1) === '?') {
        u = u.substr(1);
    }
    const r = u.match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return '';
};

let cookieCache = {};

function setCookie(cookies) {
    cookieCache = cookies || {};
}
/**
 * https://v.m.chenzhongtech.com/fw/photo/
 * 3x8qxntz6vf9f96
 * ?fid=0                              ----------v
 * &cc=share_copylink                  ----------v
 * &followRefer=151
 * &shareMethod=TOKEN                  ----------v
 * &docId=9
 * &kpn=KUAISHOU                       ----------v
 * &subBiz=BROWSE_SLIDE_PHOTO
 * &photoId=3x8qxntz6vf9f96
 * &shareId=17858424106961            ----------v
 * &shareToken=X-2tzOj39Q9vs1X4       ----------v
 * &shareResourceType=PHOTO_OTHER     ----------v
 * &userId=3xc7g46exbeuetw
 * &shareType=1
 * &et=1_a%2F2003190613205182306_sff0
 * &shareMode=APP
 * &originShareId=17858424106961
 * &appType=1
 * &shareObjectId=5235716156279250758   ----------v
 * &shareUrlOpened=0
 * &timestamp=1712186423011
 *
 * var p = 'did=web_97e0da89e0d24d61a4a32b3e3051cee8kpn=KUAISHOU{"fid":"0","shareToken":"X-2tzOj39Q9vs1X4","shareObjectId":"5235716156279250758","shareMethod":"TOKEN","shareId":"17858424106961","shareResourceType":"PHOTO_OTHER","shareChannel":"share_copylink","kpn":"KUAISHOU","subBiz":"BROWSE_SLIDE_PHOTO","env":"SHARE_VIEWER_ENV_TX_TRICK","h5Domain":"v.m.chenzhongtech.com","photoId":"3x8qxntz6vf9f96","isLongVideo":false}'
 *
 */

function getParamsObj(url) {
    const params = url.split('?')[1];
    const paramsArr = params.split('&');
    const obj = {};
    paramsArr.forEach((param) => {
        const pair = param.split('=');
        obj[pair[0]] = pair[1];
    });
    return obj;
}

function parsePArgs(realLink) {
    const domain = realLink.match(/https?:\/\/([^\/]+)/i)[1];
    const urlObj = getParamsObj(realLink);
    const pObj = {
        fid: urlObj.fid || '0',
        shareToken: urlObj.shareToken || '',
        shareObjectId: urlObj.shareObjectId || '',
        shareMethod: urlObj.shareMethod || 'TOKEN',
        shareId: urlObj.shareId || '',
        shareResourceType: urlObj.shareResourceType || 'PHOTO_OTHER',
        shareChannel: urlObj.cc || 'share_copylink',
        kpn: urlObj.kpn || 'KUAISHOU',
        subBiz: urlObj.subBiz || 'BROWSE_SLIDE_PHOTO',
        env: 'SHARE_VIEWER_ENV_TX_TRICK',
        h5Domain: domain || 'v.m.chenzhongtech.com',
        photoId: urlObj.photoId || '',
        isLongVideo: false,
    };
    const pstr = `did=${cookieCache.did || ''}kpn=${urlObj.kpn || 'KUAISHOU'}${JSON.stringify(pObj)}`;
    return { p: pstr, data: pObj };
}

async function requestVideoInfo(realLink, data, __NS_sig3) {
    const domain = realLink.match(/https?:\/\/([^\/]+)/i)[1] || 'v.m.chenzhongtech.com';
    console.log(domain);
    const url = `https://${domain}/rest/wd/photo/info?kpn=KUAISHOU&captchaToken=&__NS_sig3=${__NS_sig3}`;
    const headers = {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        origin: `https://${domain}`,
        referer: realLink,
        cookie: `did=${cookieCache.did};`,
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
    };
    console.log(url);
    console.log(headers);
    let ret;
    try {
        ret = await request({
            url, headers, method: 'POST', data,
        });
        console.log(ret);
    } catch (e) {
        console.error(e);
    }
    return ret;
}
// videoUrl, cover, user, desc
export const getVideoInfoByLinkFromKs = async (originLink) => {
    console.log(originLink);
    const realLink = await getKsRealLink(originLink);
    console.log(realLink);
    const cookeis = await parseCookieObjByLink(realLink); // 处理cookieS
    setCookie(cookeis);
    const pData = parsePArgs(realLink);
    console.log('pdata:', pData);
    const __NS_sig3 = await ksSign(pData.p);
    console.log('__NS_sig3:', __NS_sig3);
    const ret = await requestVideoInfo(realLink, pData.data, __NS_sig3);

    const videoInfoOrigin = ret.data || {};
    const { photo, mp4Url = '' } = videoInfoOrigin || {};
    const user = photo.userName || '';
    const desc = photo.caption || '';
    const coverUrls = photo.coverUrls || [];
    const cover = coverUrls[0] ? coverUrls[0].url : '';
    const videoUrl = mp4Url;

    return {
        videoUrl, cover, desc, user,
    };
};
