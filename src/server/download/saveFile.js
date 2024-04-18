/**
 * 管理下载保存的文件
 * 可以查询 删除
 * 每次初始时进行检测 如果对应的路径已经被删除 则更新config文件
 * 文件保存在
 */

import { getUserSaveFileConfig } from '../configUtil';

const fs = require('fs');

/**
 * 格式：
[
    {
        roomInfo:{},
        files:[
            {
                fileDir: '',
                size: 0,
                filePath: '',
            },
            {
                fileDir: '',
                size: 0,
                filePath: '',
            }
        ]
    }
]
 */

let SaveFileConfig = [];

const save = () => {
    const saveFileConfigFile = getUserSaveFileConfig();
    fs.writeFileSync(saveFileConfigFile, JSON.stringify(SaveFileConfig));
};

export const check = () => {
    const checkArray = SaveFileConfig || [];
    for (let i = 0; i < checkArray.length; i++) {
        const filesObj = checkArray[i];
        const { files = [] } = filesObj;
        for (let j = 0; j < files.length; j++) {
            const fileObj = files[j];
            const { filePath } = fileObj;
            try {
                fs.accessSync(filePath, fs.constants.F_OK);
            } catch (e) {
                files.splice(j, 1);
                j -= 1;
            }
        }
        if (files.length === 0) {
            checkArray.splice(i, 1);
            i -= 1;
        }
    }
};

const initSaveFileConfig = () => {
    const saveFileConfigFile = getUserSaveFileConfig();
    try {
        fs.accessSync(saveFileConfigFile, fs.constants.F_OK);
        SaveFileConfig = JSON.parse(fs.readFileSync(saveFileConfigFile));
        check();
        save();
    } catch (err) {
    // 文件不存在 新建此文件并写入默认的配置
        save();
    }
};


export const addFile = (taskObj = {}) => {
    const {
        roomInfo, size, fileDir, beginTime, filePath,
    } = taskObj;
    if (roomInfo && roomInfo.secUserId && size) {
        let hasIn = false;
        SaveFileConfig.forEach((item) => {
            const roomInfoTmp = item.roomInfo;
            const files = item.files;
            if (roomInfoTmp.secUserId === roomInfo.secUserId) {
                hasIn = true;
                if (files && files.length) {
                    let fileHasIn = false;
                    files.forEach((fileObj) => {
                        const filePathIn = fileObj.filePath;
                        if (filePathIn === filePath) {
                            fileHasIn = true;
                            fileObj.size = size;
                        }
                    });
                    if (!fileHasIn) {
                        files.push({
                            size,
                            fileDir,
                            beginTime,
                            filePath,
                        });
                    }
                } else {
                    item.files = [{
                        size,
                        fileDir,
                        beginTime,
                        filePath,
                    }];
                }
            }
        });
        if (!hasIn) {
            SaveFileConfig.push({
                roomInfo,
                files: [{
                    size,
                    fileDir,
                    beginTime,
                    filePath,
                }],
            });
        }
        save();
    }
};
export const getSaveFileList = () => SaveFileConfig;


initSaveFileConfig();
