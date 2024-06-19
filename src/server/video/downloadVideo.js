import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';
import { getAwemeId, getVideoInfoByAwemeId } from '@/server/lib/dy/dyParser';
import { getVideoInfoFromDLpanda } from '@/server/lib/tt/ttParser';
import { getVideoInfoByLinkFromKs } from '@/server/lib/ks/ksParser';
import { getVideoInfoByXHSLink } from '@/server/lib/xhs/xhsParser';
import { Download } from '@/server/download/download';
import { getVideoWorkSpace } from '../configUtil';
import { formatDay } from '../util/date';

const path = require('path');
const fs = require('fs');
// import { getVideoInfoFromDLpanda } from './parserLib/ttParser';
// import { getVideoInfoByLinkFromKs } from './parserLib/ksParser';


// 获取短视频内容
async function getVideoInfoByDYLink(originLink, options) {
    const awemeId = await getAwemeId(originLink);
    const videoInfo = await getVideoInfoByAwemeId(awemeId, options);
    if (videoInfo.code === 123) {
        // 需要验证
        return videoInfo;
    }
    try {
        const videoUrl = videoInfo.aweme_detail.video.play_addr.url_list[0] || '';
        const cover = videoInfo.aweme_detail.video.cover.url_list[0] || '';
        const user = videoInfo.aweme_detail.author.nickname || '';
        const desc = videoInfo.aweme_detail.desc || '';
        const videoInfoMy = {
            videoUrl, cover, user, desc,
        };
        return videoInfoMy;
    } catch (e) {
        console.error(e);
    }
    return {};
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
    } else if (link.indexOf('xhslink') !== -1) {
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
            videoUrl, user, type = 'video', images = [],
        } = info;
        const fileDir = path.resolve(getVideoWorkSpace(), formatDay(), user);
        if (type === 'video') {
            const filePath = path.resolve(fileDir, `${Date.now()}.mp4`);
            // 下载
            const ret = await new Promise((res) => {
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true }); // recursive选项确保创建嵌套目录
                }
                const downloader = new Download({
                    url: videoUrl,
                    filePath,
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
            info.fileDir = fileDir;
            info.filePath = ret;
        } else {
            // 下载图片
            let ret = '';
            const time = Date.now();
            for (let i = 0; i < images.length; i++) {
                const filePath = path.resolve(fileDir, `${time}_${i}.png`);
                ret = await new Promise((res) => {
                    if (!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, { recursive: true }); // recursive选项确保创建嵌套目录
                    }
                    const downloader = new Download({
                        url: images[i],
                        filePath,
                        success: () => {
                            res(filePath);
                        },
                        fail: (e) => {
                            console.log(`Error: ${e}`);
                            res('');
                        },
                    });
                    downloader.startDownload();
                });
            }
            info.fileDir = fileDir;
            info.filePath = ret;
        }
    }
    return info;
};

registHandle(HandleEvents.GET_VIDEO_INFO, getVideoInfoByLink);
registHandle(HandleEvents.DOWNLOAD_SMALL_VIDEO, downloadSmallVideoByLink);
