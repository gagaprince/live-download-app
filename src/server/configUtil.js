import { registHandle } from './ipc';

import { HandleEvents } from '@/common/eventConst';

const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const getUserPath = () => app.getPath('userData');
const getDocPath = () => app.getPath('documents');
const getAppConfigPath = () => path.resolve(getUserPath(), 'liveDownload');
const getDefaultWorkspacePath = () => path.resolve(getDocPath(), 'liveDownload');
const getDefaultVideoWorkspacePath = () => path.resolve(getDocPath(), 'videoDownload');
const getUserConfigFile = () => path.resolve(getAppConfigPath(), 'config.json');
export const getUserSaveFileConfig = () => path.resolve(getAppConfigPath(), 'saveFileConfig.json');

let AppConfig = {
    workspace: getDefaultWorkspacePath(),
    videoWorkspace: getDefaultVideoWorkspacePath(),
};

const saveAppConfig = () => {
    const configFile = getUserConfigFile();
    fs.writeFileSync(configFile, JSON.stringify(AppConfig));
};

const initAppConfig = () => {
    // 初始化AppConfig
    // 先从configfile里读取，不存在的话就新建
    const configFile = getUserConfigFile();
    try {
        fs.accessSync(configFile, fs.constants.F_OK);
        const readConfig = JSON.parse(fs.readFileSync(configFile));
        AppConfig = { ...AppConfig, ...readConfig };
    } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
        const fileDir = path.dirname(configFile);
        fs.mkdirSync(fileDir, { recursive: true });
        saveAppConfig();
    }
};

export const getWorkSpace = () => AppConfig.workspace;
export const getVideoWorkSpace = () => AppConfig.videoWorkspace;

export const setWorkSpace = (filePath) => {
    console.log('setWorkSpace', filePath);
    AppConfig.workspace = filePath;
    // 保存到文件中
    saveAppConfig();
    return true;
};

export const setVideoWorkSpace = (filePath) => {
    console.log('setVideoWorkSpace', filePath);
    AppConfig.videoWorkspace = filePath;
    // 保存到文件中
    saveAppConfig();
    return true;
};

const getRoomInfoPath = () => path.join(getAppConfigPath(), 'roominfo.json');
const getObservRoomInfoPath = () => path.join(getAppConfigPath(), 'observeRoominfo.json');
let roomInfos;
let observRoomInfos;


export const saveRoomInfos = (rmInfos) => {
    roomInfos = rmInfos;
    const roomInfoFile = getRoomInfoPath();
    fs.writeFileSync(roomInfoFile, JSON.stringify(roomInfos || []));
};

export const getRoomInfos = () => {
    if (roomInfos) return roomInfos;
    const roomInfoFile = getRoomInfoPath();
    console.log('roomInfoFile:', roomInfoFile);
    try {
        fs.accessSync(roomInfoFile, fs.constants.F_OK);
        roomInfos = JSON.parse(fs.readFileSync(roomInfoFile)) || [];
    } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
        const fileDir = path.dirname(roomInfoFile);
        fs.mkdirSync(fileDir, { recursive: true });
        saveRoomInfos(roomInfos);
    }
    return roomInfos;
};

export const saveObservRoomInfos = (rmInfos) => {
    observRoomInfos = rmInfos;
    const obRoomInfoFile = getObservRoomInfoPath();
    fs.writeFileSync(obRoomInfoFile, JSON.stringify(observRoomInfos || []));
};

export const getObservRoomInfos = () => {
    if (observRoomInfos) return observRoomInfos;
    const obRoomInfoFile = getObservRoomInfoPath();
    console.log('roomInfoFile:', obRoomInfoFile);
    try {
        fs.accessSync(obRoomInfoFile, fs.constants.F_OK);
        observRoomInfos = JSON.parse(fs.readFileSync(obRoomInfoFile)) || [];
    } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
        const fileDir = path.dirname(obRoomInfoFile);
        fs.mkdirSync(fileDir, { recursive: true });
        saveObservRoomInfos(observRoomInfos);
    }
    return observRoomInfos;
};

initAppConfig();

registHandle(HandleEvents.GET_WORKSPACE, getWorkSpace);
registHandle(HandleEvents.SET_WORKSPACE, setWorkSpace);

registHandle(HandleEvents.GET_VIDEO_WORKSPACE, getVideoWorkSpace);
registHandle(HandleEvents.SET_VIDEO_WORKSPACE, setVideoWorkSpace);
