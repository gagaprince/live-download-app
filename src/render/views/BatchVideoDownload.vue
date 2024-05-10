<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="24">
        <el-input
          v-model="formObj.originLinks"
          type="textarea"
          :rows="5"
          placeholder="请填入短视频分享链接"
        />
      </el-col>
    </el-row>
    <el-row
      :gutter="20"
      style="margin-top:50px;"
    >
      <el-col :span="8" />
      <el-col :span="10">
        <el-button
          type="primary"
          @click="download"
        >
          下载
        </el-button>
        <el-button
          type="primary"
          @click="open"
        >
          打开下载目录
        </el-button>
      </el-col>
    </el-row>
    <div class="line" />
    <div>
      <el-table
        :data="videoInfos"
        style="width: 100%; height:400px;"
      >
        <el-table-column
          sortable
          prop="user"
          label="up主"
          width="180"
        />
        <el-table-column
          label="封面"
          width="200"
        >
          <template #default="scope">
            <img
              class="avatar"
              :src="scope.row.cover"
              alt=""
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="desc"
          label="描述"
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="300"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="openFile(scope.row.filePath)"
            >
              打开
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="openDir(scope.row.fileDir)"
            >
              打开目录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-dialog v-model="batchDownloadFlag">
        <el-text
          class="mx-1"
          type="primary"
        >
          正在下载请稍后...
        </el-text>
        <div style="margin-top:20px;">
          <TaskListComponent
            v-if="batchDownloadFlag"
            :tasks="batchTasks"
            @complete="batchDownloadComplete"
          />
        </div>
      </el-dialog>
    </div>
    <div>
      <el-dialog
        v-model="verifyDialogFlag"
        style="width:600px;"
      >
        <el-row
          :gutter="24"
          type="flex"
          justify="center"
        >
          <el-text
            class="mx-1"
            type="primary"
          >
            需要您验证后重试
          </el-text>
        </el-row>
        <el-row
          :gutter="24"
          type="flex"
          justify="center"
        >
          <verifyFrame
            v-if="verifyLink"
            :verify-link="verifyLink"
          />
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8" />
          <el-col :span="12">
            <el-form-item style="justify-content:center;">
              <el-button
                type="primary"
                @click="hideVerifyDialog(true)"
              >
                确认
              </el-button>
              <el-button @click="hideVerifyDialog(false)">
                取消
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {
    openDirectory, getVideoWorkspace, downloadSmallVideoByLink,
} from '@/render/common/ipcUtil';

import TaskListComponent from '@/render/components/tasklist/index.vue';
import verifyFrame from '@/render/components/verifyFrame/index.vue';

export default {
    components: {
        TaskListComponent,
        verifyFrame,
    },
    data() {
        return {
            formObj: {
                originLinks: '',
            },
            downloadPath: '',
            batchDownloadFlag: false,
            batchTasks: [],
            videoInfos: [],
            verifyDialogFlag: false,
            verifyLink: '',
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            this.downloadPath = await getVideoWorkspace();
        },
        _getRealLink(content) {
            const contentReg = new RegExp(/.*?([a-zA-z]+:\/\/[^\s]*)\s{0,}.*?/g);
            const ret = contentReg.exec(content);
            if (ret && ret.length > 1) {
                return ret[1];
            }
            return '';
        },
        async download() {
            const originLinks = this.formObj.originLinks;
            console.log(originLinks);
            if (originLinks) {
                const list = originLinks.split('\n');
                console.log(list);
                this.videoInfos = [];
                this.batchDownload(list);
            }
        },
        open() {
            console.log(this.downloadPath);
            openDirectory(this.downloadPath);
        },
        openFile(filePath) {
            openDirectory(filePath);
        },
        openDir(fileDir) {
            openDirectory(fileDir);
        },

        batchDownload(links) {
            console.log('批量下载:', links);
            const fp = window.localStorage.getItem('dy_fp') || '';
            const tasks = links.map((linkContent) => async () => {
                if (!linkContent) return;
                console.log('-------------------------------');
                console.log(`当前要解析${linkContent}`);
                const link = this._getRealLink(linkContent);
                console.log(`获取实际链接${link}`);
                // const videoInfo = await getVideoInfoByLink(link);
                const videoInfo = await downloadSmallVideoByLink(link, { fp });
                const flag = this.checkVideoInfoVerify(videoInfo);
                if (flag) {
                    if (videoInfo && videoInfo.videoUrl) {
                        console.log('视频信息:', videoInfo);
                        this.videoInfos.push(videoInfo);
                    }
                }
                console.log('-------------------------------');
            });
            this.batchTasks = tasks;
            this.batchDownloadFlag = true;
        },
        batchDownloadComplete() {
            this.batchDownloadFlag = false;
            this.batchTasks = [];
            if (!this.videoInfos.length) {
                this.$message({
                    message: '下载中有报错请稍后重试',
                    type: 'error',
                });
            } else {
                this.$message({
                    message: '下载完毕',
                    type: 'success',
                });
            }
        },

        checkVideoInfoVerify(videoInfo) {
            if (videoInfo.code === 123) {
                this.showVerifyDialog(videoInfo.data || {});
                return false;
            }
            return true;
        },

        showVerifyDialog(verifyData) {
            if (this.verifyDialogFlag) return;
            console.log('showVerifyDialog', verifyData);
            const { verifyUrl } = verifyData;
            this.verifyData = verifyData;
            if (verifyUrl) {
                this.verifyLink = verifyUrl;
                this.verifyDialogFlag = true;
            }
        },
        hideVerifyDialog(flag) {
            console.log('hideVerifyDialog', flag);
            this.verifyLink = '';
            this.verifyDialogFlag = false;
            if (flag) {
                // 保存 fp
                console.log('save fp:', this.verifyData);
                const { fp } = this.verifyData;
                console.log(fp);
                window.localStorage.setItem('dy_fp', fp);
            }
        },

    },
};
</script>
  <style lang="scss" scoped>
  .h-c{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .line{
      width: 100%;
      height:1px;
      border-bottom: 1px dashed #ccc;
      margin: 30px 0;
  }
  .avatar{
    display: block;
    width:100px;
    // height:50px;

  }
  .online{
    color: green;
  }
  .webview{
    margin-top: 30px;
    width:100%;
    height:1px;
  }
  </style>
