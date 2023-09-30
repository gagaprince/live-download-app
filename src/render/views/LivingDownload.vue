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
      label="已完成"
      name="finish"
    >
      已完成
    </el-tab-pane>
    <el-tab-pane
      label="监听开播"
      name="taskManage"
    >
      监听开播任务管理
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Downloading from '@/render/components/download/downloading';

export default {
    components: {
        Downloading,
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
