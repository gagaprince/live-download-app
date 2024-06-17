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
  <div style="margin-top: 20px;">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-input
          v-model="oldUrl"
          placeholder="请输链接"
        />
      </el-col>
      <el-col :span="8">
        <el-input
          v-model="userAgent"
          placeholder="请输ua"
        />
      </el-col>
      <el-col :span="8">
        <el-button
          type="primary"
          @click="getSignUrl"
        >
          sign
        </el-button>
      </el-col>
      <el-col :span="8">
        signUrl:{{ signUrl }}
      </el-col>
    </el-row>
  </div>

  <div style="margin-top: 20px;">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-input
          v-model="originVideoLink"
          placeholder="请输入短视频原链接"
        />
      </el-col>
      <el-col :span="8">
        <el-button
          type="primary"
          @click="getVideoInfo"
        >
          测试获取videoInfo
        </el-button>
      </el-col>
      <el-col :span="8">
        videoUrl:{{ videoInfo.videoUrl || '' }}
      </el-col>
    </el-row>
  </div>
  <div style="margin-top: 20px;">
    <el-row :gutter="24">
      <el-col :span="24">
        <verifyFrame
          v-if="verifyLink"
          :verify-link="verifyLink"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {
    anysisRoomInfo, addRoom, getttwid, getRealLink, anysisRoomInfoFromLink, getVideoInfoByLink,
} from '@/render/common/ipcUtil';

import { dySignNew } from '@/render/common/lib/a_bogus';
import verifyFrame from '@/render/components/verifyFrame/index.vue';

export default {
    components: {
        verifyFrame,
    },
    data() {
        return {
            roomInfo: {},
            roomInfos: [],
            webviewLink: '',
            webviewsrc: '',
            ttwid: '',
            realLink: '',
            originLink: '',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            oldUrl: '',
            signUrl: '',
            originVideoLink: '',
            videoInfo: {},
            verifyLink: '',
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
            // const url = 'https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=MS4wLjABAAAA2qJpSW9YHmPvpZohGaTVbR-HHSo2aHazQlp4QHSBOEo&count=2&max_cursor=0&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333';
            // const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

            // const ret1 = dySign(url, useragent);
            // console.log('getRoomInfo:', ret1);
            const ret = await anysisRoomInfoFromLink(this.originLink);
            console.log(ret);
        },
        getSignUrl() {
            const ret = dySignNew(this.oldUrl, this.userAgent);
            console.log(ret);
            this.signUrl = ret.url;
        },
        async getVideoInfo() {
            const ret = await getVideoInfoByLink(this.originVideoLink);
            this.videoInfo = ret;
            console.log('videoInfo:', ret);
            if (ret.code === 123) {
                this.showVerify(ret.data.verifyUrl);
                // this.showVerify('https://rmc.bytedance.com/verifycenter/captcha/v2?from=iframe&fp=verify_lw04plx5_7f29059d_3fce_5c66_51de_c72db3bb9936&env=%7B%22screen%22%3A%7B%22w%22%3A1728%2C%22h%22%3A1117%7D%2C%22browser%22%3A%7B%22w%22%3A1728%2C%22h%22%3A997%7D%2C%22page%22%3A%7B%22w%22%3A298%2C%22h%22%3A910%7D%2C%22document%22%3A%7B%22width%22%3A298%7D%2C%22product_host%22%3A%22www.douyin.com%22%2C%22vc_version%22%3A%221.0.0.60%22%2C%22maskTime%22%3A1715312185635%2C%22h5_check_version%22%3A%223.8.6%22%7D&aid=6383&host=%2F%2Fverify.zijieapi.com%2F&verify_data=%7B%22code%22%3A%2210000%22%2C%22from%22%3A%22%22%2C%22type%22%3A%22verify%22%2C%22version%22%3A%22%22%2C%22region%22%3A%22cn%22%2C%22subtype%22%3A%22slide%22%2C%22ui_type%22%3A%22%22%2C%22detail%22%3A%22y3c1v0Gdq1Gt0vlfQW*gQ8kROBCa5WM5TEwIyAi1LBHsdCSCPUnO7YJW0KRU7uklJ5VUpCA8xoeiKcb7AYJS9yrGCJN*hRCmg9xearxeT37qqH7H7KscL7wl8LAaKVw6*S4OwZaa0nOWX2U*7xfZqMZRmDaOKBJJD8COGWOLvVFs1LP0lLNQrulQx0ttnAj7rYivwxM6xS8d6p5LnjtnpNaB-2KownO4skjEpXF9imyq*P9LRE6LSD8M4EdwlMC3iH-gEHyfGeu6Lz4o-vbYaUyMRmhFTEYUqwbSR7lgOLsmsj7ayQTJ6zCoFraj24jvrJ32vferhzTPp*yb59SUNYc7qPgVRrJbCIIC4Z7BvEmQLMZ5qAQNyz2bIdsw2eREEBwhfU*fg9WXHmoUdVR8KJ42b33-4tBxyEoE9HXK1ixp7kPA-pueoqM1qguMCYhl0x3H5T*5YikL6c*8qCillQtu1DmflURccdY0%22%2C%22verify_event%22%3A%226120%22%2C%22fp%22%3A%22verify_lw04l50y_0078ea0c_c536_246b_2c6f_614a87ac2994%22%2C%22server_sdk_env%22%3A%22%7B%5C%22idc%5C%22%3A%5C%22lf%5C%22%2C%5C%22region%5C%22%3A%5C%22CN%5C%22%2C%5C%22server_type%5C%22%3A%5C%22whale%5C%22%7D%22%2C%22log_id%22%3A%222024051011362585D6073037D5B6043AAF%22%2C%22is_assist_mobile%22%3Afalse%2C%22is_complex_sms%22%3Afalse%2C%22identity_action%22%3A%22%22%2C%22identity_scene%22%3A%22%22%2C%22login_status%22%3A0%2C%22aid%22%3A0%7D');
                console.log('fp:', ret.data.fp);
            }
        },
        showVerify(verifyLink) {
            this.verifyLink = verifyLink;
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
