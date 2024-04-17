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

  <!-- <el-button @click="handleDownload">
    测试下载
  </el-button> -->


  <div style="margin-top: 20px;">
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
      <el-col
        :span="24"
        style="position: absolute; top:-10000px;"
      >
        <webview
          ref="webviewRef"
          :src="webviewsrc"
          class="webview"
        />
      </el-col>
    </el-row>
  </div>

  <div style="margin-top: 100px;">
    <el-row :gutter="24">
      <el-col :span="4">
        <el-button
          type="primary"
          @click="getttwid"
        >
          测试getttwid
        </el-button>
      </el-col>
      <el-col :span="12">
        ttwid:{{ ttwid }}
      </el-col>
    </el-row>
  </div>
  <div style="margin-top: 20px;">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-input
          v-model="originLink"
          placeholder="请输入原链接"
        />
      </el-col>
      <el-col :span="8">
        <el-button
          type="primary"
          @click="getRealLink"
        >
          测试getRealLink
        </el-button>
      </el-col>
      <el-col :span="8">
        realLink:{{ realLink }}
      </el-col>
    </el-row>
  </div>
  <div style="margin-top: 20px;">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-input
          v-model="originLink"
          placeholder="请输入原链接"
        />
      </el-col>
      <el-col :span="8">
        <el-button
          type="primary"
          @click="getRoomInfo"
        >
          测试从中心获取roomInfo
        </el-button>
      </el-col>
      <el-col :span="8">
        realLink:{{ realLink }}
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {
    anysisRoomInfo, addRoom, getttwid, getRealLink, // anysisRoomInfoFromLink,
} from '@/render/common/ipcUtil';

import { dySign } from '@/render/common/lib/X-Bogus';

export default {
    data() {
        return {
            roomInfo: {},
            roomInfos: [],
            webviewLink: '',
            webviewsrc: '',
            ttwid: '',
            realLink: '',
            originLink: '',
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
            setTimeout(() => {
                this.parseLiveLink();
            }, 5000);
        },
        parseLiveLink() {
            const webview = this.$refs.webviewRef;
            webview.executeJavaScript('window.location.href').then(async (ret) => {
                console.log('currentLink:', ret);
                const roomInfo = await anysisRoomInfo(ret);
                console.log('获取的roomInfo:', roomInfo);
                if (roomInfo && roomInfo.roomId) {
                    // 添加roomInfo
                    const saveFlag = await addRoom(roomInfo);
                    if (saveFlag) {
                        this.$message({
                            message: '添加成功',
                            type: 'success',
                        });
                    }
                } else {
                    this.$message({
                        message: '添加失败,获取房间信息失败',
                        type: 'error',
                    });
                }
            });
        },
        async getttwid() {
            const ret = await getttwid();
            this.ttwid = ret;
            console.log(ret);
        },
        async getRealLink() {
            const ret = await getRealLink(this.originLink);
            this.realLink = ret;
            console.log(ret);
        },
        async getRoomInfo() {
            const url = 'https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=MS4wLjABAAAA2qJpSW9YHmPvpZohGaTVbR-HHSo2aHazQlp4QHSBOEo&count=2&max_cursor=0&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333';
            const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

            const ret = dySign(url, useragent);
            console.log(ret);

            // const ret = await anysisRoomInfoFromLink(this.originLink);
            // // this.realLink = ret;
            // console.log(ret);
        },
    },
};
</script>
<style lang="scss" scoped>
.webview{
  margin-top: 30px;
  width:100%;
  height:1px;
}
</style>
