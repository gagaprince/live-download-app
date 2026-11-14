import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';
import { parseDyShareLink } from '@/server/lib/dy/dyBrowser';
import { getVideoInfoFromDLpanda } from '@/server/lib/tt/ttParser';
import { getVideoInfoByLinkFromKs } from '@/server/lib/ks/ksParser';
import { getVideoInfoByXHSLink } from '@/server/lib/xhs/xhsParser';
import { Download } from '@/server/download/download';
import { getVideoWorkSpace } from '../configUtil';
import { formatDay } from '../util/date';

const path = require('path');
const fs = require('fs');

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';

const getImgExt = (url) => {
    const match = (url || '').match(/\.(jpeg|jpg|png|webp|gif|bmp)(\?|$)/i);
    return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
};

// 获取短视频内容
async function getVideoInfoByDYLink(originLink) {
    const videoInfo = await parseDyShareLink(originLink);
    if (videoInfo && videoInfo.errorMsg) {
        return videoInfo;
    }
    if (!videoInfo || (!videoInfo.videoUrl && !(videoInfo.images && videoInfo.images.length))) {
        return { errorMsg: '抖音作品解析失败，请稍后重试' };
    }
    return {
        ...videoInfo,
        downloadRefer: originLink,
    };
}
async function getVideoInfoByTTLink(originLink) {
    const ret = await getVideoInfoFromDLpanda(originLink);
    console.log(ret);
    return ret;
}
async function getVideoInfoByKSLink(originLink) {
    const videoInfo = await getVideoInfoByLinkFromKs(originLink);
    return videoInfo;
}


// 检测是什么平台
// https://v.douyin.com/iFCvgktY/
// https://www.tiktok.com/t/ZPRTuroNq/
// https://v.kuaishou.com/vLhwdi
function checkPL(link = '') {
    if (link.indexOf('douyin') !== -1) {
        return 'dy';
    } else if (link.indexOf('tiktok') !== -1) {
        return 'tt';
    } else if (link.indexOf('kuaishou') !== -1) {
        return 'ks';
    } else if (link.indexOf('xhslink') !== -1 || link.indexOf('xiaohongshu.com') !== -1) {
        return 'xhs';
    }

    return 'none';
}

/**
 *
 * @param {*} link
 * videoInfo {
 *  videoUrl, cover, user, desc
 * }
 */
export const getVideoInfoByLink = async (link, options) => {
    let videoInfo;
    switch (checkPL(link)) {
        case 'dy':
            videoInfo = await getVideoInfoByDYLink(link, options);
            break;
        case 'tt':
            videoInfo = await getVideoInfoByTTLink(link);
            break;
        case 'ks':
            videoInfo = await getVideoInfoByKSLink(link);
            break;
        case 'xhs':
            videoInfo = await getVideoInfoByXHSLink(link);
            break;
        default:
    }
    console.log('videoInfo:', videoInfo);
    return {
        user: 'tt暂时无用户信息',
        cover: 'https://p0.meituan.net/travelcube/bef32336873e45d3350b9201ab505f7b23324.png',
        desc: 'tt暂时无简介',
        ...videoInfo,
    };
};

export const downloadSmallVideoByLink = async (link, options = {}) => {
    const info = await getVideoInfoByLink(link, options);
    if (info) {
        console.log(info);
        const {
            videoUrl, user, type = 'video', images = [], imageExts = [], liveVideos = [], downloadRefer = '',
        } = info;
        if (!videoUrl && (!images || !images.length)) {
            return info;
        }
        const fileDir = path.resolve(getVideoWorkSpace(), formatDay(), user);
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true }); // recursive选项确保创建嵌套目录
        }
        const startDownload = (url, filePath, headers = null) => new Promise((res) => {
            const downloader = new Download({
                url,
                filePath,
                headers: headers || undefined,
                success: () => {
                    res(filePath);
                },
                fail: (e) => {
                    global.logRender('下载出错：', e);
                    console.log(`Error: ${e}`);
                    res('');
                },
            });
            downloader.startDownload();
        });
        if (type === 'video') {
            const filePath = path.resolve(fileDir, `${Date.now()}.mp4`);
            const ret = await startDownload(videoUrl, filePath, {
                Referer: downloadRefer || videoUrl,
                'User-Agent': MOBILE_UA,
                Range: 'bytes=0-',
            });
            info.fileDir = fileDir;
            info.filePath = ret;
        } else {
            // 下载图文/实况照片（实况照片额外下载每一张的动态mp4）
            let ret = '';
            const time = Date.now();
            for (let i = 0; i < images.length; i++) {
                const ext = imageExts[i] || getImgExt(images[i]);
                const filePath = path.resolve(fileDir, `${time}_${i}.${ext}`);
                ret = await startDownload(images[i], filePath);
                if (type === 'livePhoto' && liveVideos[i]) {
                    const livePath = path.resolve(fileDir, `${time}_${i}_live.mp4`);
                    await startDownload(liveVideos[i], livePath, {
                        Referer: downloadRefer || liveVideos[i],
                        'User-Agent': MOBILE_UA,
                        Range: 'bytes=0-',
                    });
                }
            }
            info.fileDir = fileDir;
            info.filePath = ret;
        }
    }
    return info;
};

registHandle(HandleEvents.GET_VIDEO_INFO, getVideoInfoByLink);
registHandle(HandleEvents.DOWNLOAD_SMALL_VIDEO, downloadSmallVideoByLink);
