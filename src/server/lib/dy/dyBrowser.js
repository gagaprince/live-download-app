const { app, BrowserWindow } = require('electron');

const PARTITION = 'persist:dyParser';
const PAGE_WAIT_MS = 75000;
const AWE_ME_WAIT_MS = 15000;
const MANUAL_VERIFY_MS = 90000;
const CHALLENGE_RELOAD_AT = [15000, 30000, 45000, 60000];
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// 在页面上下文里遍历 React Fiber，找到当前作品的 aweme 信息对象
const EXTRACT_AWEME_JS = `(function () {
  function scanAweme(obj, depth, seen, bucket) {
    if (depth > 10 || obj === null || obj === undefined) return;
    const t = typeof obj;
    if (t !== 'object' && t !== 'function') return;
    if (seen.has(obj)) return;
    seen.add(obj);
    let keys = [];
    try { keys = Object.keys(obj); } catch (e) { return; }
    const looksAweme = obj.awemeId && obj.desc !== undefined && obj.video && Array.isArray(obj.video.playAddr);
    if (looksAweme) {
      bucket.push(obj);
      return;
    }
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === 'return' || k === 'child' || k === 'sibling' || k === 'alternate' || k === 'stateNode' || k === '_owner') continue;
      try { scanAweme(obj[k], depth + 1, seen, bucket); } catch (e) { /* noop */ }
      if (bucket.length >= 6) return;
    }
  }
  return function extract() {
    const idMatch = location.pathname.match(/\\/(?:video|note)\\/(\\d+)/);
    const expectedId = idMatch ? idMatch[1] : '';
    const els = document.querySelectorAll('*');
    const mainBucket = [];
    const relatedBucket = [];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const isRelated = String(el.className || '').indexOf('related-list') !== -1;
      const fiberKey = Object.keys(el).find((k) => k.indexOf('__reactFiber$') === 0 || k.indexOf('__reactProps$') === 0);
      if (!fiberKey) continue;
      const bucket = isRelated ? relatedBucket : mainBucket;
      try { scanAweme(el[fiberKey], 0, new Set(), bucket); } catch (e) { /* noop */ }
      if (mainBucket.length >= 3) break;
    }
    const all = mainBucket.concat(relatedBucket);
    // 只接受与当前URL中awemeId匹配的数据，避免页面切换时拿到上一页的残留数据
    const matched = expectedId ? all.find((a) => String(a.awemeId) === expectedId) : all[0];
    if (!matched) return null;
    return {
      awemeId: String(matched.awemeId),
      desc: matched.desc || '',
      authorInfo: matched.authorInfo || null,
      video: matched.video || null,
      images: Array.isArray(matched.images) ? matched.images : [],
      isSlides: !!matched.isSlides,
    };
  };
})()`;

const PAGE_STATE_JS = `JSON.stringify({
  title: document.title,
  bodyLen: document.body ? document.body.innerHTML.length : 0,
  href: location.href,
})`;

let parserWin = null;
let createPromise = null;
let taskQueue = Promise.resolve();
const watchedWindows = new WeakSet();
let lifecycleWired = false;

// 隐藏解析窗口不能阻止应用退出：主窗口全部关闭后主动销毁解析窗口，让 window-all-closed 正常触发
function setupLifecycleWatcher() {
    if (lifecycleWired) return;
    lifecycleWired = true;
    const hasVisibleOtherWindow = () => BrowserWindow.getAllWindows()
        .some((win) => win !== parserWin && !win.isDestroyed() && win.isVisible());
    const watchWindow = (win) => {
        if (win === parserWin || watchedWindows.has(win)) return;
        watchedWindows.add(win);
        win.on('closed', () => {
            if (!hasVisibleOtherWindow() && parserWin && !parserWin.isDestroyed()) {
                parserWin.destroy();
            }
        });
    };
    app.on('browser-window-created', (event, win) => watchWindow(win));
    BrowserWindow.getAllWindows().forEach(watchWindow);
    app.on('before-quit', () => {
        if (parserWin && !parserWin.isDestroyed()) parserWin.destroy();
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickImageUrl(urlList) {
    if (!Array.isArray(urlList) || !urlList.length) return '';
    const jpeg = urlList.find((u) => u.indexOf('.jpeg') !== -1 || u.indexOf('.jpg') !== -1);
    return jpeg || urlList[urlList.length - 1] || urlList[0];
}

function getImageExt(url) {
    if (url.indexOf('.webp') !== -1) return 'webp';
    if (url.indexOf('.png') !== -1) return 'png';
    return 'jpg';
}

function getPlayUrl(playAddr) {
    if (!Array.isArray(playAddr) || !playAddr.length) return '';
    const first = playAddr[0];
    if (typeof first === 'string') return first;
    return (first && first.src) || '';
}

// 把页面里的 aweme 对象映射成下载流程需要的结构
function normalizeAweme(aweme) {
    const video = aweme.video || {};
    const cover = (video.coverUrlList && video.coverUrlList[0])
        || (video.originCoverUrlList && video.originCoverUrlList[0])
        || (video.cover && video.cover.urlList && video.cover.urlList[0])
        || '';
    const user = (aweme.authorInfo && aweme.authorInfo.nickname) || '抖音用户';
    const desc = aweme.desc || '';
    const rawImages = aweme.images || [];

    if (!rawImages.length) {
        return {
            videoUrl: getPlayUrl(video.playAddr),
            cover,
            user,
            desc,
            type: 'video',
            images: [],
            imageExts: [],
            liveVideos: [],
            awemeId: aweme.awemeId,
        };
    }

    const images = [];
    const imageExts = [];
    const liveVideos = [];
    let isLivePhoto = false;
    rawImages.forEach((item) => {
        const stillUrl = pickImageUrl(item.urlList);
        images.push(stillUrl);
        imageExts.push(getImageExt(stillUrl));
        const motionUrl = item.video ? getPlayUrl(item.video.playAddr) : '';
        if (motionUrl || item.livePhotoType === 1) isLivePhoto = true;
        liveVideos.push(motionUrl);
    });

    return {
        videoUrl: '',
        cover: cover || images[0] || '',
        user,
        desc,
        type: isLivePhoto ? 'livePhoto' : 'note',
        images,
        imageExts,
        liveVideos,
        awemeId: aweme.awemeId,
    };
}

async function createParserWindow() {
    await app.whenReady();
    if (parserWin && !parserWin.isDestroyed()) return parserWin;
    if (createPromise) return createPromise;
    setupLifecycleWatcher();
    createPromise = (async () => {
        const win = new BrowserWindow({
            show: false,
            width: 1200,
            height: 900,
            webPreferences: {
                partition: PARTITION,
                contextIsolation: true,
                nodeIntegration: false,
                backgroundThrottling: false,
                javascript: true,
            },
        });
        win.webContents.setUserAgent(DESKTOP_UA);
        win.on('closed', () => {
            parserWin = null;
        });
        win.webContents.on('render-process-gone', () => {
            if (parserWin && !parserWin.isDestroyed()) parserWin.destroy();
            parserWin = null;
        });
        parserWin = win;
        return win;
    })();
    try {
        await createPromise;
    } finally {
        createPromise = null;
    }
    return parserWin;
}

async function getPageState(win) {
    const raw = await win.webContents.executeJavaScript(PAGE_STATE_JS).catch(() => '{}');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function isChallengePage(state) {
    return !state.title || state.title.indexOf('验证码') !== -1 || !state.bodyLen || state.bodyLen < 50000;
}

function getIdFromHref(href) {
    const match = (href || '').match(/\/(?:video|note)\/(\d+)/);
    return match ? match[1] : '';
}

async function waitRealPage(win, link) {
    const startedAt = Date.now();
    win.webContents.loadURL(link).catch(() => {});
    const reloaded = new Set();
    let targetId = '';
    let stableCount = 0;
    while (Date.now() - startedAt < PAGE_WAIT_MS) {
        await sleep(1000);
        const state = await getPageState(win);
        const currentId = getIdFromHref(state.href);
        // URL 中的作品 id 发生变化说明导航还在进行，不能复用旧页面的数据
        if (currentId && currentId !== targetId) {
            targetId = currentId;
            stableCount = 0;
        } else if (currentId && currentId === targetId && !isChallengePage(state)) {
            stableCount += 1;
            if (stableCount >= 2) return true;
        } else {
            stableCount = 0;
        }
        const elapsed = Date.now() - startedAt;
        for (const point of CHALLENGE_RELOAD_AT) {
            if (elapsed >= point && !reloaded.has(point)) {
                reloaded.add(point);
                targetId = '';
                stableCount = 0;
                win.webContents.loadURL(state.href || link).catch(() => {});
            }
        }
    }
    return false;
}

async function extractAweme(win) {
    const deadline = Date.now() + AWE_ME_WAIT_MS;
    while (Date.now() < deadline) {
        const aweme = await win.webContents.executeJavaScript(`${EXTRACT_AWEME_JS}()`).catch(() => null);
        if (aweme && aweme.awemeId) return aweme;
        await sleep(1000);
    }
    return null;
}

// 隐藏窗口没能自动过验证时，把窗口展示给用户手动滑验证
async function waitManualVerify(win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    const deadline = Date.now() + MANUAL_VERIFY_MS;
    while (Date.now() < deadline) {
        await sleep(1000);
        const state = await getPageState(win);
        if (!isChallengePage(state)) {
            const aweme = await extractAweme(win);
            if (aweme) {
                win.hide();
                return aweme;
            }
        }
    }
    win.hide();
    return null;
}

async function parseInWindow(link) {
    const win = await createParserWindow();
    const pageReady = await waitRealPage(win, link);
    if (!pageReady) {
        const manual = await waitManualVerify(win);
        if (!manual) {
            return {
                errorMsg: '抖音风控验证未通过，请稍后重试或在弹出的窗口中完成验证',
            };
        }
        return normalizeAweme(manual);
    }
    const aweme = await extractAweme(win);
    if (!aweme) {
        const manual = await waitManualVerify(win);
        if (!manual) {
            return {
                errorMsg: '抖音作品信息获取失败，请稍后重试',
            };
        }
        return normalizeAweme(manual);
    }
    return normalizeAweme(aweme);
}

// 串行化，复用同一个隐藏窗口
export const parseDyShareLink = (link) => {
    const task = taskQueue.then(() => parseInWindow(link), () => parseInWindow(link));
    taskQueue = task.catch(() => {});
    return task;
};
