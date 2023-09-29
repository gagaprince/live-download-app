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
      正在下载
    </el-tab-pane>
    <el-tab-pane
      label="已完成"
      name="finish"
    >
      已完成
    </el-tab-pane>
    <el-tab-pane
      label="任务管理"
      name="taskManage"
    >
      监听开播任务管理
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
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
