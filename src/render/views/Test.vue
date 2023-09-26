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
</template>
<script>
import { anysisRoomInfo } from '@/render/common/ipcUtil';

export default {
    data() {
        return {
            roomInfo: {},
            roomInfos: [],
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
    },
};
</script>
