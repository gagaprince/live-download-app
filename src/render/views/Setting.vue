<template>
  <div>
    <input style="display:none;" type="file" ref="directoryInput" webkitdirectory @change="handleDirectoryChange">
    <el-text> 设置 </el-text>
    <el-row class="workspace-setting">
      <el-col :span="3" class="h-c">
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
              @click="selectFolder"
              ><Folder
            /></el-icon>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row class="bottom-row">
      <el-col :span="15" class="bottom-row-center">
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getWorkspace, setWorkspace } from '@/render/common/ipcUtil';
export default {
  mounted() {
    this.initWorkspace();
  },
  data() {
    return {
      workspace: '',
    };
  },
  methods: {
    async initWorkspace() {
      const workspace = await getWorkspace();
      this.workspace = workspace;
    },
    selectFolder() {
      this.$refs.directoryInput.click();
    },
    handleDirectoryChange(event) {
      const files = event.target.files
      if (files.length > 0) {
        const file = files[0];
        this.workspace = file.path.replace(file.name, '');
      }
    },
    saveConfig() { 
      const flag = setWorkspace(this.workspace);
      if (flag) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
      }
    }
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
