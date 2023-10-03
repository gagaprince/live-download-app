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
          prop="owner"
          label="房主"
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
              @click="openLiveLink(scope.row.liveLink)"
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
          <el-form-item label="直播链接">
            <el-input v-model="addRoomObj.link" />
          </el-form-item>
          <el-form-item style="justify-content:center;">
            <el-button
              type="primary"
              @click="submitAddForm"
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
  </div>
</template>
<script>
import {
    searchRoomInfos, anysisRoomInfo, addRoom, openLink, deleteRoom, addDownloadTask, addObserverDownload,
} from '@/render/common/ipcUtil';
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
            },
            addRoomModalFlag: false,
            batchCheckFlag: false,
            batchTasks: [],
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
            this.roomInfos = await searchRoomInfos();
        },
        showAddRoomModal() {
            // 添加房间的弹窗
            this.addRoomModalFlag = true;
        },
        async submitAddForm() {
            try {
                // 提交增加room
                console.log('分析room信息:', this.addRoomObj);
                const roomInfo = await anysisRoomInfo(this.addRoomObj.link);
                console.log('获取的roomInfo:', roomInfo);
                if (roomInfo && roomInfo.roomId) {
                    // 添加roomInfo
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
            console.log('检测此链接是否在线', oldRoomInfo.liveLink);
            const roomInfo = await anysisRoomInfo(oldRoomInfo.liveLink);
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
            const ret = await deleteRoom(roomInfo.webRoomId);
            if (ret) {
                this.$message({
                    message: '删除成功',
                    type: 'success',
                });
                this.search();
            }
        },
        async addDownloadTask(roomInfo) {
            addDownloadTask(roomInfo.webRoomId);
        },
        async addOpenLiveListener(roomInfo) {
            console.log('addOpenLiveListener:', roomInfo.webRoomId);
            await addObserverDownload(roomInfo.webRoomId);
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
</style>
