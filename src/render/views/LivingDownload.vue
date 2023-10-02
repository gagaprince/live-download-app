<template>
  <el-tabs
    v-model="activeName"
    type="card"
    class="demo-tabs"
    @tab-click="handleClick"
  >
    <el-tab-pane
      label="正在下载"
      name="downloading"
    >
      <Downloading />
    </el-tab-pane>
    <el-tab-pane
      label="已保存"
      name="finish"
    >
      <SaveFileInfo />
    </el-tab-pane>
    <el-tab-pane
      label="监听开播"
      name="taskManage"
    >
      <ObservDownload />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Downloading from '@/render/components/download/downloading.vue';
import SaveFileInfo from '@/render/components/download/saveFileInfo.vue';
import ObservDownload from '@/render/components/download/ObserveDownload.vue';

export default {
    components: {
        Downloading,
        SaveFileInfo,
        ObservDownload,
    },
    data() {
        return {
            activeName: 'downloading',
        };
    },
    methods: {
        handleClick(tab, event) {
            console.log(tab, event);
        },
    },
};
</script>

<style lang="scss" scoped>

</style>
