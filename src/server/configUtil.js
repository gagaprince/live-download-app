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

const initAppConfig = () => {
  // 初始化AppConfig
  // 先从configfile里读取，不存在的话就新建
  const configFile = getUserConfigFile();
  const appConfigPath = getAppConfigPath();
  try {
    fs.accessSync(configFile, fs.constants.F_OK);
    AppConfig = JSON.parse(fs.readFileSync(configFile));
  } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
    const fileDir = path.dirname(configFile);
    fs.mkdirSync(fileDir, { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify(AppConfig));
  }
};

export const getWorkSpace = () => {
  return AppConfig.workspace;
};

initAppConfig();

registHandle(HandleEvents.GET_WORKSPACE, getWorkSpace);
