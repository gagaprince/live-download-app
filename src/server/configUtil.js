const { app } = require('electron');
const fs = require('fs');
const path = require('path');

import { registHandle } from './ipc';
import { HandleEvents } from '@/common/eventConst';

const getUserPath = () => app.getPath('userData');
const getDocPath = () => app.getPath('documents');
const getAppConfigPath = () => path.resolve(getUserPath(), 'liveDownload');
const getDefaultWorkspacePath = () =>
  path.resolve(getDocPath(), 'liveDownload');
const getUserConfigFile = () => path.resolve(getAppConfigPath(), 'config.json');

let AppConfig = {
  workspace: getDefaultWorkspacePath(),
};

const saveAppConfig = () => {
  const configFile = getUserConfigFile();
  fs.writeFileSync(configFile, JSON.stringify(AppConfig));
}

const initAppConfig = () => {
  // 初始化AppConfig
  // 先从configfile里读取，不存在的话就新建
  const configFile = getUserConfigFile();
  try {
    fs.accessSync(configFile, fs.constants.F_OK);
    AppConfig = JSON.parse(fs.readFileSync(configFile));
  } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
    const fileDir = path.dirname(configFile);
    fs.mkdirSync(fileDir, { recursive: true });
    saveAppConfig();
  }
};

export const getWorkSpace = () => {
  return AppConfig.workspace;
};

export const setWorkSpace = (path) => {
  console.log('setWorkSpace', path);
  AppConfig.workspace = path;
  // 保存到文件中
  saveAppConfig();
  return true;
};

const getRoomInfoPath = () => path.join(getAppConfigPath(), 'roominfo.json');
let roomInfos;


export const saveRoomInfos = (rmInfos) => {
  roomInfos = rmInfos;
  const roomInfoFile = getRoomInfoPath();
  fs.writeFileSync(roomInfoFile, JSON.stringify(roomInfos || []));
};

export const getRoomInfos = () => {
  if (roomInfos) return roomInfos;
  const roomInfoFile = getRoomInfoPath();
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



initAppConfig();

registHandle(HandleEvents.GET_WORKSPACE, getWorkSpace);
registHandle(HandleEvents.SET_WORKSPACE, setWorkSpace)
