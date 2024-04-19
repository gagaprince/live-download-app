<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input
          v-model="formObj.owner"
          placeholder="up主姓名"
        />
      </el-col>
      <el-col :span="6">
        <el-input
          v-model="formObj.roomId"
          placeholder="直播间id"
        />
      </el-col>
      <el-col :span="12">
        <el-button
          type="primary"
          @click="search"
        >
          搜索
        </el-button>
        <el-button
          type="primary"
          @click="showAddRoomModal"
        >
          新增
        </el-button>
        <el-button
          type="primary"
          @click="batchCheck"
        >
          批量更新
        </el-button>
      </el-col>
    </el-row>
    <div class="line" />
    <div>
      <el-table
        :data="roomInfos"
        style="width: 100%; height:600px;"
      >
        <el-table-column
          label="头像"
          width="100"
        >
          <template #default="scope">
            <img
              class="avatar"
              :src="scope.row.avatar"
              alt=""
            >
          </template>
        </el-table-column>
        <el-table-column
          sortable
          prop="webRoomId"
          label="房间号"
          width="180"
        />
        <el-table-column
          prop="roomTitle"
          label="描述"
        />
        <el-table-column
          label="是否在线"
          width="100"
        >
          <template #default="scope">
            <div class="h-c">
              <el-icon
                class="isonline-icon"
                :class="{'online':scope.row.isOnline}"
              >
                <Film />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="分类"
          width="100"
        >
          <template #default="scope">
            <div>
              {{ getType(scope.row.roomType || 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner"
          label="房主"
          width="180"
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="240"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="checkLiveOnline(scope.row)"
            >
              检测
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="openLiveLink(scope.row.hoomLink)"
            >
              打开
            </el-button>
            <el-button
              v-if="scope.row.isOnline"
              link
              type="primary"
              size="small"
              @click="addDownloadTask(scope.row)"
            >
              下载
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="addOpenLiveListener(scope.row)"
            >
              监听
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="openEditDialog(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="deleteRoom(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-dialog v-model="addRoomModalFlag">
        <el-form
          ref="addRoomForm"
          :model="addRoomObj"
        >
          <el-form-item label="个人主页链接">
            <el-input
              v-model="addRoomObj.link"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="请选择分类">
            <el-select
              v-model="addRoomObj.roomType"
              placeholder="请选择直播分类"
            >
              <el-option
                v-for="item in roomTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item style="justify-content:center;">
            <el-button
              type="primary"
              @click="aynsisLiveLinkAndSubmit"
            >
              提交
            </el-button>
            <el-button @click="closeAddRoomDialog">
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <div>
      <el-dialog v-model="batchCheckFlag">
        <el-text
          class="mx-1"
          type="primary"
        >
          正在检测请稍后...
        </el-text>
        <div style="margin-top:20px;">
          <TaskListComponent
            :tasks="batchTasks"
            @complete="batchCheckComplete"
          />
        </div>
      </el-dialog>
    </div>
    <div>
      <el-dialog v-model="addObserveFlag">
        <el-form
          ref="addObserveForm"
          :model="addObserveRoomObj"
        >
          <el-form-item label="请选择分类">
            <el-select
              v-model="addObserveRoomObj.observeType"
              placeholder="请选择监听分类"
            >
              <el-option
                v-for="item in roomTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item style="justify-content:center;">
            <el-button
              type="primary"
              @click="addOpenLiveListener"
            >
              确认
            </el-button>
            <el-button @click="closeAddObserveRoomDialog">
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <div>
      <el-dialog
        v-model="editRoomModalFlag"
        style="width:600px;"
      >
        <el-form
          ref="editRoomInfoForm"
          :inline="true"
          class="demo-form-inline"
          :model="editRoomObj"
        >
          <el-form-item>
            <div class="block">
              <el-avatar
                shape="square"
                :size="50"
                :src="editRoomObj.roomInfo.avatar"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="block">
              {{ editRoomObj.roomInfo.owner }}
            </div>
          </el-form-item>
          <el-form-item label="请选择分类">
            <el-select
              v-model="editRoomObj.roomType"
              placeholder="请选择分类"
            >
              <el-option
                v-for="item in roomTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <el-row :gutter="24">
          <el-col :span="8" />
          <el-col :span="12">
            <el-form-item style="justify-content:center;">
              <el-button
                type="primary"
                @click="editRoomInfo"
              >
                确认
              </el-button>
              <el-button @click="closeEditDialog">
                取消
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
    <div style="position: absolute; top:-10000px;">
      <webview
        ref="webviewRef"
        :src="webviewsrc"
        class="webview"
      />
    </div>
  </div>
</template>
<script>
import {
    searchRoomInfos, addRoom, openLink, deleteRoom, addDownloadTask, addObserverDownload, anysisRoomInfoFromLink, anysisRoomInfoBySecUserId,
    editRoomTypeByUserId,
} from '@/render/common/ipcUtil';

import { RoomTypeOpts } from '@/common/eventConst';

import TaskListComponent from '@/render/components/tasklist/index.vue';

export default {
    components: {
        TaskListComponent,
    },
    data() {
        return {
            roomInfos: [],
            formObj: {
                owner: '',
                roomId: '',
            },
            addRoomObj: {
                link: '',
                roomType: '1',
            },
            roomTypeOpts: RoomTypeOpts,
            addObserveRoomObj: {
                observeType: '1',
            },
            editRoomObj: {
                roomInfo: null,
                roomType: '1',
            },
            addRoomModalFlag: false,
            batchCheckFlag: false,
            addObserveFlag: false,
            editRoomModalFlag: false,
            batchTasks: [],
            webviewsrc: '',
        };
    },
    mounted() {
        this.initRoomInfos();
    },
    methods: {
        async initRoomInfos() {
            this.roomInfos = await searchRoomInfos();
        },
        async search() {
            console.log('search');
            console.log('searchObj:', this.formObj);
            this.roomInfos = await searchRoomInfos({ ...this.formObj });
            console.log(this.roomInfos);
        },
        showAddRoomModal() {
            // 添加房间的弹窗
            this.addRoomModalFlag = true;
        },
        _getRealLink(content) {
            const contentReg = new RegExp(/.*?([a-zA-z]+:\/\/[^\s]*)\s{0,}.*?/g);
            const ret = contentReg.exec(content);
            if (ret && ret.length > 1) {
                return ret[1];
            }
            return '';
        },
        async aynsisLiveLinkAndSubmit() {
            console.log('分析room信息:', this.addRoomObj);
            const originLink = this._getRealLink(this.addRoomObj.link);
            if (!originLink) {
                this.$message({
                    message: '链接有误，请检查后重试',
                    type: 'error',
                });
            }
            if (this._checkLink(originLink)) {
                this.submitAddForm(originLink, this.addRoomObj.roomType);
            }
            // this.webviewsrc = originLink;
            // setTimeout(() => {
            //     this.parseLiveLink();
            // }, 3000);
        },
        // https://v.douyin.com/iYq1U9VH/
        _checkLink(link) {
            console.log(link);
            return true;
        },
        parseLiveLink() {
            const webview = this.$refs.webviewRef;
            webview.executeJavaScript('window.location.href').then(async (ret) => {
                console.log('currentLink:', ret);
                if (this._checkLink(ret)) {
                    this.submitAddForm(ret);
                } else {
                    this.$message({
                        message: '解析失败请重试',
                        type: 'error',
                    });
                }
            });
        },
        async submitAddForm(link, type) {
            try {
                // 提交增加room
                const roomInfo = await anysisRoomInfoFromLink(link);
                console.log('获取的roomInfo:', roomInfo);
                if (roomInfo && roomInfo.secUserId) {
                    // 添加roomInfo
                    roomInfo.roomType = type;
                    const saveFlag = await addRoom(roomInfo);
                    if (saveFlag) {
                        this.$message({
                            message: '添加成功',
                            type: 'success',
                        });
                        this.closeAddRoomDialog();
                        this.addRoomObj.link = '';
                        this.search();
                    }
                } else {
                    this.$message({
                        message: '添加失败,获取房间信息失败',
                        type: 'error',
                    });
                }
            } catch (e) {
                console.error(e);
                this.$message({
                    message: '添加失败',
                    type: 'error',
                });
            }
        },
        closeAddRoomDialog() {
            this.addRoomModalFlag = false;
        },
        async checkLiveOnline(oldRoomInfo, isBatch = false) {
            console.log('检测此用户是否直播在线', oldRoomInfo.secUserId);
            const roomInfo = await anysisRoomInfoBySecUserId(oldRoomInfo.secUserId);
            if (roomInfo.flvLink !== oldRoomInfo.flvLink) {
                const saveFlag = await addRoom(roomInfo);
                if (saveFlag) {
                    if (!isBatch) {
                        this.$message({
                            message: '状态更新成功',
                            type: 'success',
                        });
                        this.search();
                    }
                    return;
                }
            }
            if (!isBatch) {
                this.$message({
                    message: '状态没有变化',
                    type: 'success',
                });
            }
        },
        async openLiveLink(link) {
            console.log('将要打开link:', link);
            const ret = await openLink(link);
            if (ret) {
                console.log('打开链接成功', link);
            }
        },
        batchCheck() {
            console.log('批量检测:', this.roomInfos);
            const tasks = this.roomInfos.map((roomInfo) => async () => {
                await this.checkLiveOnline(roomInfo, true);
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });
            });
            this.batchTasks = tasks;
            this.batchCheckFlag = true;
        },
        batchCheckComplete() {
            this.$message({
                message: '批量检测完成',
                type: 'success',
            });
            this.batchCheckFlag = false;
            this.batchTasks = [];
            this.search();
        },
        async deleteRoom(roomInfo) {
            const ret = await deleteRoom(roomInfo.secUserId);
            if (ret) {
                this.$message({
                    message: '删除成功',
                    type: 'success',
                });
                this.search();
            }
        },
        async addDownloadTask(roomInfo) {
            addDownloadTask(roomInfo.secUserId);
        },
        async addOpenLiveListener(roomInfo) {
            // const roomInfo = this.addObserveRoomObj.roomInfo;
            // const type = this.addObserveRoomObj.observeType;
            // console.log('addOpenLiveListener:', roomInfo.secUserId);
            // console.log('添加到分类:', type);

            await addObserverDownload(roomInfo.secUserId);
        },
        async openLiveListenerDialog(roomInfo) {
            // 打开监听配置dialog
            this.addObserveRoomObj.roomInfo = roomInfo;
            this.addObserveFlag = true;
        },
        closeAddObserveRoomDialog() {
            this.addObserveRoomObj.roomInfo = null;
            this.addObserveFlag = false;
        },
        getType(type) {
            const typeMap = this.roomTypeOpts.reduce((pre, item) => {
                pre[item.value] = item;
                return pre;
            }, {});
            return typeMap[type].label;
        },
        openEditDialog(roomInfo) {
            console.log('openEditDialog:', roomInfo);
            this.editRoomObj.roomInfo = roomInfo;
            this.editRoomModalFlag = true;
        },
        closeEditDialog() {
            this.editRoomModalFlag = false;
            this.editRoomObj.roomInfo = {};
        },
        async editRoomInfo() {
            const roomInfo = this.editRoomObj.roomInfo;
            roomInfo.roomType = this.editRoomObj.roomType;
            const saveFlag = await editRoomTypeByUserId(this.editRoomObj.roomType, roomInfo.secUserId);
            if (saveFlag) {
                this.$message({
                    message: '状态更新成功',
                    type: 'success',
                });
                this.search();
            }
            this.closeEditDialog();
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
  width:50px;
  height:50px;

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
