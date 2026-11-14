import { registHandle, getMainWindow } from '../ipc';
import { HandleEvents, RenderReceiveEvents } from '@/common/eventConst';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app, nativeImage } = require('electron');

let runningChild = null;

const IMAGE_SUFFIXES = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff',
]);

const buildThumb = (filePath) => {
    try {
        const image = nativeImage.createFromPath(filePath);
        if (image.isEmpty()) return '';
        const resized = image.resize({ width: 320 });
        return `data:image/jpeg;base64,${resized.toJPEG(82).toString('base64')}`;
    } catch (err) {
        console.error('生成缩略图失败:', filePath, err);
        return '';
    }
};

const ensureInsideOutput = (filePath, dir) => {
    const root = path.resolve(dir);
    const resolved = path.resolve(filePath);
    if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) {
        throw new Error('非法路径, 仅允许操作输出目录内的文件');
    }
    if (!IMAGE_SUFFIXES.has(path.extname(resolved).toLowerCase())) {
        throw new Error('仅允许操作图片文件');
    }
    return resolved;
};

const listOutputImages = async (dir) => {
    if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return { success: false, message: '输出目录不存在', images: [] };
    }
    const names = await fs.promises.readdir(dir);
    const entries = await Promise.all(names.map(async (name) => {
        if (!IMAGE_SUFFIXES.has(path.extname(name).toLowerCase())) return null;
        const filePath = path.join(dir, name);
        let stat;
        try {
            stat = await fs.promises.stat(filePath);
        } catch (err) {
            return null;
        }
        if (!stat.isFile()) return null;
        return {
            name,
            path: filePath,
            size: stat.size,
            mtimeMs: stat.mtimeMs,
            thumb: buildThumb(filePath),
        };
    }));
    const images = entries.filter(Boolean);
    images.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
    return { success: true, images };
};

const readOutputImage = async (filePath, dir) => {
    try {
        const resolved = ensureInsideOutput(filePath, dir);
        if (!fs.existsSync(resolved)) {
            return { success: false, message: '图片文件不存在' };
        }
        const image = nativeImage.createFromPath(resolved);
        if (image.isEmpty()) {
            return { success: false, message: '图片读取失败' };
        }
        const ext = path.extname(resolved).toLowerCase();
        let mime = 'image/jpeg';
        if (ext === '.png') {
            mime = 'image/png';
        } else if (ext === '.webp') {
            mime = 'image/webp';
        }
        const buffer = ext === '.png' ? image.toPNG() : image.toJPEG(92);
        return { success: true, url: `data:${mime};base64,${buffer.toString('base64')}` };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

const deleteOutputFile = async (filePath, dir) => {
    try {
        const resolved = ensureInsideOutput(filePath, dir);
        await fs.promises.unlink(resolved);
        return { success: true, path: resolved };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

const sendProgress = (payload) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
        win.webContents.send(RenderReceiveEvents.HEAD_CUT_PROGRESS, payload);
    }
};

const isHeadcutHome = (dir) => {
    if (!dir) return false;
    return fs.existsSync(path.join(dir, 'headcut', '__main__.py'));
};

export const resolveHeadcutHome = (customHome) => {
    const candidates = [
        customHome,
        process.env.HEADCUT_HOME,
        path.resolve(process.cwd(), '..', 'headcut'),
        path.resolve(app.getAppPath(), '..', 'headcut'),
    ].filter(Boolean);
    const matched = candidates.find(isHeadcutHome);
    if (matched) return matched;
    throw new Error(
        `未找到 headcut 项目目录, 已尝试: ${candidates.join('; ')}。`
        + '请在界面中指定 headcut 项目目录, 或设置环境变量 HEADCUT_HOME。',
    );
};

const resolvePython = (home) => {
    const venvPython = process.platform === 'win32'
        ? path.join(home, '.venv', 'Scripts', 'python.exe')
        : path.join(home, '.venv', 'bin', 'python');
    if (fs.existsSync(venvPython)) return venvPython;
    return process.platform === 'win32' ? 'python' : 'python3';
};

const parseLine = (line, stats) => {
    const totalMatch = line.match(/共发现\s*(\d+)\s*张图片/);
    if (totalMatch) {
        stats.total = Number(totalMatch[1]);
    }
    if (line.includes('[裁切]')) {
        stats.cropped += 1;
    } else if (line.includes('[未检测到人脸]')) {
        stats.noFace += 1;
    } else if (line.includes('[处理失败]')) {
        stats.failed += 1;
    }
    const summaryMatch = line.match(
        /共\s*(\d+)\s*张,\s*裁切输出\s*(\d+)\s*张,\s*无人脸\s*(\d+)\s*张,\s*失败\s*(\d+)\s*张/,
    );
    if (summaryMatch) {
        stats.total = Number(summaryMatch[1]);
        stats.cropped = Number(summaryMatch[2]);
        stats.noFace = Number(summaryMatch[3]);
        stats.failed = Number(summaryMatch[4]);
        stats.summary = line.trim();
    }
};

const buildArgs = (options) => {
    const args = [
        '-m', 'headcut',
        options.inputDir,
        '-o', options.outputDir,
        '-s', String(options.size || 1024),
        '--scale', String(options.scale || 2.6),
    ];
    if (options.recursive !== false) {
        args.push('-r');
    }
    if (options.confidence) {
        args.push('--confidence', String(options.confidence));
    }
    return args;
};

const runHeadCut = (options = {}) => new Promise((resolve) => {
    if (runningChild) {
        resolve({ success: false, message: '已有裁切任务正在运行, 请先停止或等待完成' });
        return;
    }
    if (!options.inputDir || !fs.existsSync(options.inputDir)) {
        resolve({ success: false, message: '待裁切图片目录不存在' });
        return;
    }
    if (!options.outputDir) {
        resolve({ success: false, message: '请选择裁切结果输出目录' });
        return;
    }

    let home;
    let python;
    try {
        home = resolveHeadcutHome(options.headcutHome);
        python = resolvePython(home);
    } catch (err) {
        resolve({ success: false, message: err.message });
        return;
    }

    fs.mkdirSync(options.outputDir, { recursive: true });

    const stats = {
        total: 0, cropped: 0, noFace: 0, failed: 0, summary: '',
    };
    const logs = [];
    const pushLog = (line) => {
        const text = line.toString().trim();
        if (!text) return;
        logs.push(text);
        if (logs.length > 500) logs.shift();
        parseLine(text, stats);
        const finished = stats.cropped + stats.noFace + stats.failed;
        const percentage = stats.total > 0
            ? Math.min(100, Math.round((finished / stats.total) * 100))
            : 0;
        sendProgress({
            stage: 'log',
            message: text,
            total: stats.total,
            cropped: stats.cropped,
            noFace: stats.noFace,
            failed: stats.failed,
            percentage,
        });
    };

    const args = buildArgs(options);
    sendProgress({
        stage: 'start',
        message: `启动 headcut: ${python} ${args.join(' ')}`,
        home,
    });

    let stderrTail = '';
    const child = spawn(python, args, {
        cwd: home,
        windowsHide: true,
        env: {
            ...process.env,
            PYTHONUTF8: '1',
            PYTHONIOENCODING: 'utf-8',
        },
    });
    runningChild = child;

    const handleData = (chunk) => {
        chunk.toString('utf8').split(/\r?\n/).forEach(pushLog);
    };
    child.stdout.on('data', handleData);
    child.stderr.on('data', (chunk) => {
        const text = chunk.toString('utf8');
        stderrTail = `${stderrTail}${text}`.slice(-2000);
        text.split(/\r?\n/).forEach((line) => {
            if (line.trim()) pushLog(line);
        });
    });
    child.on('error', (err) => {
        runningChild = null;
        const message = `调用 Python 失败: ${err.message}。请确认 headcut 虚拟环境已安装依赖。`;
        sendProgress({ stage: 'error', message });
        resolve({ success: false, message, logs });
    });
    child.on('close', (code) => {
        runningChild = null;
        const success = code === 0 && stats.failed === 0;
        const result = {
            success,
            stopped: child.killed,
            code,
            total: stats.total,
            cropped: stats.cropped,
            noFace: stats.noFace,
            failed: stats.failed,
            summary: stats.summary,
            stderrTail,
            logs,
        };
        sendProgress({ stage: 'done', ...result });
        resolve(result);
    });
});

const stopHeadCut = () => {
    if (!runningChild) return { success: false, message: '当前没有运行中的裁切任务' };
    runningChild.kill();
    return { success: true, message: '已请求停止裁切任务' };
};

registHandle(HandleEvents.HEAD_CUT, runHeadCut);
registHandle(HandleEvents.HEAD_CUT_STOP, stopHeadCut);
registHandle(HandleEvents.HEAD_CUT_LIST_FILES, listOutputImages);
registHandle(HandleEvents.HEAD_CUT_READ_IMAGE, readOutputImage);
registHandle(HandleEvents.HEAD_CUT_DELETE_FILE, deleteOutputFile);
