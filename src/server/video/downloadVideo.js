import { registHandle } from '../ipc';
import { HandleEvents } from '@/common/eventConst';
import { getAwemeId, getVideoInfoByAwemeId } from '@/server/lib/dy/dyParser';
import { Download } from '@/server/download/download';
import { getVideoWorkSpace } from '../configUtil';
import { formatDay } from '../util/date';

const path = require('path');
const fs = require('fs');
// import { getVideoInfoFromDLpanda } from './parserLib/ttParser';
// import { getVideoInfoByLinkFromKs } from './parserLib/ksParser';


// 获取短视频内容
async function getVideoInfoByDYLink(originLink) {
    const awemeId = await getAwemeId(originLink);
    const videoInfo = await getVideoInfoByAwemeId(awemeId);
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
    console.log(originLink);
    // const ret = await getVideoInfoFromDLpanda(originLink);
    // console.log(ret);
    // return ret;
}
async function getVideoInfoByKSLink(originLink) {
    console.log(originLink);
    // const videoInfo = await getVideoInfoByLinkFromKs(originLink);
    // return videoInfo;
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
export const getVideoInfoByLink = async (link) => {
    let videoInfo;
    switch (checkPL(link)) {
        case 'dy':
            videoInfo = await getVideoInfoByDYLink(link);
            break;
        case 'tt':
            videoInfo = await getVideoInfoByTTLink(link);
            break;
        case 'ks':
            videoInfo = await getVideoInfoByKSLink(link);
            break;
        default:
    }
    return videoInfo;
};

export const downloadSmallVideoByLink = async (link) => {
    const info = await getVideoInfoByLink(link);
    if (info) {
        console.log(info);
        const { videoUrl, user } = info;

        const fileDir = path.resolve(getVideoWorkSpace(), formatDay(), user);
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
                    console.log(`Error: ${e}`);
                    res('');
                },
            });
            downloader.startDownload();
        });
        info.fileDir = fileDir;
        info.filePath = ret;
    }
    return info;
};

registHandle(HandleEvents.GET_VIDEO_INFO, getVideoInfoByLink);
registHandle(HandleEvents.DOWNLOAD_SMALL_VIDEO, downloadSmallVideoByLink);
