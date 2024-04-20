<template>
  <div class="container">
    <el-container>
      <el-header class="header">
        直播&短视频下载工具
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="activeMenu"
            class="menu"
            router
          >
            <el-menu-item index="/living-room-info">
              <el-icon><VideoPlay /></el-icon>
              <span>
                直播间信息管理
              </span>
            </el-menu-item>
            <el-menu-item index="/living-download">
              <el-icon><Download /></el-icon>
              <span>直播下载</span>
            </el-menu-item>
            <el-menu-item index="/batch-download">
              <el-icon><Coordinate /></el-icon>
              <span>短视频下载</span>
            </el-menu-item>
            <el-menu-item index="/setting">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
            <el-menu-item index="/test">
              <el-icon><Setting /></el-icon>
              <span>测试</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main><router-view /></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
    data() {
        return {
            activeMenu: '/living-room-info',
        };
    },
    watch: {
        $route(to) {
            this.activeMenu = to.path;
        },
    },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
  background: #fff;
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>
