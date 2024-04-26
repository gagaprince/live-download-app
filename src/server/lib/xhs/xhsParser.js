
import { request } from '../request';

// http://xhslink.com/M5ijAH
export const getXHSRealLink = async (link) => {
    try {
        const ret = await request({
            url: link,
            responseType: 'text',
            followRedirects: 0,
            headers: {
                Host: 'xhslink.com',
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
    const keys = ['acw_tc', 'abRequestId']; // 这里是你要获取的 cookie 的 key
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

const getHtmlFromLink = async (url, cookies) => {
    try {
        const ret = await request({
            url,
            data: {},
            responseType: 'text',
            followRedirects: 0,
            headers: {
                Host: 'www.xiaohongshu.com',
                cookie: cookies ? `acw_tc=${cookies.acw_tc}` : '',
                accept: '*/*',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
            },
        });
        const { httpCode, data, headers } = ret;
        if (httpCode === 302) {
            const location = headers.Location || headers.location || '';
            const setCookies = headers['Set-Cookie'] || '';
            const parseCookies = parseCookieObj(setCookies);
            return await getHtmlFromLink(location, parseCookies);
        } else {
            return data;
        }
    } catch (e) {
        console.error(e);
    }
    return '';
};

const parseInitData = (htmlContent) => {
    const text = htmlContent;
    // console.log(text);
    const pattern = /window\.__INITIAL_STATE__=(\{.*\})<\/script>/;
    const match = text.match(pattern);

    if (match) {
        const matchStr = match[1].replace(/\\u002F/g, '/');
        // console.log(matchStr);
        // return JSON.parse(matchStr);
        return matchStr;
    }
    return {};
};

const parseVideoUrl = (initData) => {
    const text = initData;
    const pattern = /"originVideoKey":"(.*?)"/;
    const match = text.match(pattern);

    if (match) {
        console.log(match[1]); // 打印匹配到的originVideoKey的值
        return `https://sns-video-bd.xhscdn.com/${match[1]}`;
    } else {
        const pattern2 = /"masterUrl":"(.*?)"/;
        const match2 = text.match(pattern2);
        if (match2) {
            console.log('masterUrl：', match2[1]);
            return match2[1];
        }
    }
    return '';
};

const parseCover = (initData) => {
    const text = initData;
    const pattern = /"avatar":"(.*?)"/;
    const match = text.match(pattern);

    if (match) {
        console.log(match[1]);
        return match[1];
    }
    return '';
};
const parseUser = (initData) => {
    const text = initData;
    const pattern = /"nickname":"(.*?)"/;
    const match = text.match(pattern);

    if (match) {
        console.log(match[1]);
        return match[1];
    }
    return '';
};
const parseDesc = (initData) => {
    const text = initData;
    const pattern = /"video","title":"(.*?)","desc"/;
    const match = text.match(pattern);

    if (match) {
        console.log(match[1]);
        return match[1];
    }
    return '';
};


export const getVideoInfoByXHSLink = async (link) => {
    const realLink = await getXHSRealLink(link);
    console.log(realLink);
    const html = await getHtmlFromLink(realLink);
    // console.log(html);
    const initData = parseInitData(html);
    const videoUrl = parseVideoUrl(initData);
    const cover = parseCover(initData);
    const user = parseUser(initData);
    // const desc = parseDesc(initData);
    return {
        videoUrl, cover, user,
    };
};
