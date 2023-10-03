<template>
  <el-button @click="handleAnysis">
    测试分析直播信息
  </el-button>
  <el-table :data="roomInfos">
    <el-table-column
      label="头像"
      width="100"
    >
      <template #default="scope">
        <img
          :src="scope.row.avatar"
          alt=""
        >
      </template>
    </el-table-column>
    <el-table-column
      prop="owner"
      label="房主"
      width="180"
    />
    <el-table-column
      prop="roomId"
      label="房间号"
    />

    <el-table-column
      prop="liveLink"
      label="房间链接"
    />
  </el-table>

  <el-button @click="handleDownload">
    测试下载
  </el-button>


  <div>
    测试 webview
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input
          v-model="webviewLink"
          placeholder="要打开的webview链接"
        />
      </el-col>
      <el-col :span="12">
        <el-button
          type="primary"
          @click="openWebview"
        >
          确定
        </el-button>
        <el-button
          type="primary"
          @click="parseLiveLink"
        >
          获取直播链接 并添加
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <webview
          ref="webviewRef"
          :src="webviewsrc"
          class="webview"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { anysisRoomInfo } from '@/render/common/ipcUtil';

export default {
    data() {
        return {
            roomInfo: {},
            roomInfos: [],
            webviewLink: '',
            webviewsrc: '',
        };
    },
    methods: {
        async handleAnysis() {
            const ret = await anysisRoomInfo('https://live.douyin.com/50338791669');
            console.log('ret:', ret);
            this.roomInfo = ret;
            this.roomInfos = [ret];
        },
        handleDownload() {
            console.log('下载：', this.roomInfo.flvLink);
        },
        openWebview() {
            console.log('打开webview：', this.webviewLink);
            this.webviewsrc = this.webviewLink;
        },
        parseLiveLink() {
            const webview = this.$refs.webviewRef;
            webview.executeJavaScript('window.location.href').then((ret) => {
                console.log('currentLink:', ret);
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.webview{
  margin-top: 30px;
  width:100%;
  height:500px;
}
</style>
