import axios from 'axios';
import { request } from '../request';

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const toHttps = (url) => (url && url.startsWith('http://') ? url.replace('http://', 'https://') : url);

// 短链还原：xhslink.com / xhslink.cn 会 302 到带 xsec_token 的真实笔记链接
// http://xhslink.com/M5ijAH
export const getXHSRealLink = async (link) => {
    if (!link) return '';
    // 已经是完整的笔记页链接，直接使用（必须保留 xsec_token 等查询参数）
    if (link.indexOf('xiaohongshu.com') !== -1) return link;
    try {
        const ret = await request({
            url: link,
            responseType: 'text',
            followRedirects: false,
            headers: {
                pragma: 'no-cache',
                accept: '*/*',
                'user-agent': MOBILE_UA,
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
            },
        });
        const headers = ret.headers || {};
        return headers.location || headers.Location || '';
    } catch (e) {
        const resp = e.response || {};
        const headers = resp.headers || {};
        if (headers.location || headers.Location) {
            return headers.location || headers.Location;
        }
        console.error('xhs short link resolve failed:', e.message);
    }
    return '';
};

const fetchNoteHtml = async (url) => {
    const ret = await axios.get(url, {
        headers: {
            // 桌面端 UA 才能拿到包含 noteDetailMap 的完整 SSR 页面，移动端页面结构不同
            'User-Agent': DESKTOP_UA,
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
        },
        timeout: 15000,
        maxRedirects: 5,
    });
    return typeof ret.data === 'string' ? ret.data : '';
};

// 小红书会在状态数据里注入字面量 undefined，直接 JSON.parse 会抛错，这里只替换作为 JSON 值出现的 undefined
const parseInitialState = (html) => {
    const match = html.match(/window\.__INITIAL_STATE__=(\{.*\})<\/script>/);
    if (!match) return null;
    const sanitized = match[1].replace(/([[,:])undefined(?=[,\]}])/g, '$1null');
    try {
        return JSON.parse(sanitized);
    } catch (e) {
        console.error('xhs __INITIAL_STATE__ parse failed:', e.message);
        return null;
    }
};

const pickNote = (state) => {
    const noteMap = state && state.note && state.note.noteDetailMap;
    if (!noteMap) return null;
    const currentId = state.note.currentNoteId;
    const id = noteMap[currentId] ? currentId : Object.keys(noteMap)[0];
    const entry = noteMap[id];
    return entry && entry.note ? entry.note : null;
};

const extractVideoUrl = (note, rawStateText) => {
    const stream = note.video && note.video.media && note.video.media.stream;
    if (stream) {
        // 优先 h264 兼容性最好，依次降级 h265 / av1
        const groups = [stream.h264, stream.h265, stream.av1].filter(Array.isArray);
        for (const group of groups) {
            const item = group.find((v) => v && v.masterUrl);
            if (item) return toHttps(item.masterUrl);
        }
        for (const group of groups) {
            const item = group.find((v) => v && Array.isArray(v.backupUrls) && v.backupUrls.length);
            if (item) return toHttps(item.backupUrls[0]);
        }
    }
    // 结构变化时的正则兜底
    const originMatch = rawStateText.match(/"originVideoKey":"(.*?)"/);
    if (originMatch) {
        return `https://sns-video-bd.xhscdn.com/${originMatch[1]}`;
    }
    const masterMatch = rawStateText.match(/"masterUrl":"(.*?)"/);
    if (masterMatch) {
        return toHttps(masterMatch[1].replace(/\\u002F/g, '/'));
    }
    return '';
};

const extractImages = (note) => (note.imageList || [])
    .map((img) => toHttps(img.urlDefault || img.url || img.urlPre || ''))
    .filter(Boolean);

const extractCover = (note, images) => {
    const videoCover = note.video && note.video.image;
    const cover = (note.cover && (note.cover.url || note.cover.urlDefault))
        || (videoCover && (videoCover.firstFrame || videoCover.thumbnail))
        || images[0]
        || (note.user && note.user.avatar)
        || '';
    return toHttps(cover);
};

const extractDesc = (note, html) => {
    if (note.desc) return note.desc;
    if (note.title) return note.title;
    const ogTitle = html.match(/<meta property="og:title" content="(.*?)">/);
    return ogTitle ? ogTitle[1] : '';
};

export const getVideoInfoByXHSLink = async (link) => {
    const emptyResult = {
        videoUrl: '', cover: '', user: '', type: 'image', desc: '', images: [], errorMsg: '',
    };
    const realLink = await getXHSRealLink(link);
    if (!realLink) {
        return { ...emptyResult, errorMsg: '小红书短链还原失败，请检查链接后重试' };
    }
    let html;
    try {
        html = await fetchNoteHtml(realLink);
    } catch (e) {
        console.error('xhs note page fetch failed:', e.message);
        return { ...emptyResult, errorMsg: '小红书笔记页面访问失败，请稍后重试' };
    }
    const state = parseInitialState(html);
    const note = state && pickNote(state);
    if (!note) {
        return { ...emptyResult, errorMsg: '未能解析到笔记内容，可能已删除、链接失效或需要验证' };
    }
    const isVideo = note.type === 'video';
    const images = isVideo ? [] : extractImages(note);
    const videoUrl = isVideo ? extractVideoUrl(note, html) : '';
    if (isVideo && !videoUrl) {
        return { ...emptyResult, errorMsg: '视频地址解析失败，请稍后重试' };
    }
    if (!isVideo && !images.length) {
        return { ...emptyResult, errorMsg: '图片地址解析失败，请稍后重试' };
    }
    return {
        videoUrl,
        cover: extractCover(note, images),
        user: (note.user && note.user.nickname) || '小红书用户',
        type: isVideo ? 'video' : 'image',
        desc: extractDesc(note, html),
        images,
        downloadRefer: realLink,
    };
};
