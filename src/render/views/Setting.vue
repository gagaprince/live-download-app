<template>
  <div>
    <el-text> 设置 </el-text>
    <el-row class="workspace-setting">
      <el-col
        :span="3"
        class="h-c"
      >
        <el-text>工作目录：</el-text>
      </el-col>
      <el-col :span="12">
        <el-input
          v-model="workspace"
          placeholder="输入或者选择工作目录，并保存"
        >
          <template #append>
            <el-icon
              class="select-folder"
              color="#fece65"
              size="20"
              @click="selectFolder('workspace')"
            >
              <Folder />
            </el-icon>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row class="workspace-setting">
      <el-col
        :span="3"
        class="h-c"
      >
        <el-text>短视频下载目录：</el-text>
      </el-col>
      <el-col :span="12">
        <el-input
          v-model="videoWorkspace"
          placeholder="输入或者选择短视频下载目录，并保存"
        >
          <template #append>
            <el-icon
              class="select-folder"
              color="#fece65"
              size="20"
              @click="selectFolder('videoWorkspace')"
            >
              <Folder />
            </el-icon>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row class="bottom-row">
      <el-col
        :span="15"
        class="bottom-row-center"
      >
        <el-button
          type="primary"
          @click="saveConfig"
        >
          保存
        </el-button>
        <el-button
          type="primary"
          @click="openDevTool"
        >
          打开控制台
        </el-button>
        <el-button
          type="primary"
          @click="relaunchApp"
        >
          重启app
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {
    getWorkspace, setWorkspace, selectDirectory, getVideoWorkspace, setVideoWorkspace, openDevTool, relaunchApp,
} from '@/render/common/ipcUtil';

export default {
    data() {
        return {
            workspace: '',
            videoWorkspace: '',
        };
    },
    mounted() {
        this.initWorkspace();
        console.log('mounted');
    },
    methods: {
        async initWorkspace() {
            const workspace = await getWorkspace();
            const videoWorkspace = await getVideoWorkspace();
            this.workspace = workspace;
            this.videoWorkspace = videoWorkspace;
        },
        async selectFolder(type) {
            const ret = await selectDirectory();
            console.log(ret);
            if (ret && !ret.canceled) {
                const path = ret.filePaths[0];
                if (path) {
                    this[type] = path;
                }
            }
        },
        saveConfig() {
            const flag1 = setWorkspace(this.workspace);
            const flag2 = setVideoWorkspace(this.videoWorkspace);
            if (flag1 && flag2) {
                this.$message({
                    message: '保存成功',

                    type: 'success',
                });
            }
        },
        openDevTool() {
            openDevTool();
        },
        relaunchApp() {
            relaunchApp();
        },
    },
};
</script>
<style lang="scss" scoped>
.h-c {
  justify-content: center;
  align-items: center;
  display: flex;
}
.workspace-setting {
  margin-top: 20px;
}
.bottom-row {
  margin-top: 40px;
}
.bottom-row-center {
  justify-content: flex-end;
  display: flex;
}
.select-folder {
  cursor: pointer;
}
</style>
