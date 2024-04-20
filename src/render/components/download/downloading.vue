<template>
  <div class="form">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-button
          type="primary"
          @click="refreshDownload"
        >
          刷新
        </el-button>
        <el-button
          type="primary"
          @click="showAddDownload"
        >
          新增下载
        </el-button>
      </el-col>
    </el-row>
  </div>
  <div class="downloading-table">
    <el-table
      :data="downloadTasks"
      style="width: 100%;height:600px;"
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
        prop="owner"
        label="房主"
        width="180"
      />
      <el-table-column
        label="分类"
        width="100"
      >
        <template #default="scope">
          <div>
            {{ getType(scope.row.roomInfo.roomType || 1) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileSize"
        label="已下载"
        width="180"
      />
      <el-table-column
        prop="costTime"
        label="持续时间"
        width="180"
      />
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="stopTask(scope.row)"
          >
            停止
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="openDir(scope.row)"
          >
            打开
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="download-dialog">
    <el-dialog v-model="addDownloadModalFlag">
      <el-form
        ref="addDownload"
        :model="addDownloadObj"
      >
        <el-form-item label="直播链接">
          <el-input v-model="addDownloadObj.link" />
        </el-form-item>
        <el-form-item style="justify-content:center;">
          <el-button
            type="primary"
            @click="submitAddForm"
          >
            提交
          </el-button>
          <el-button @click="closeAddDownloadDialog">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import {
    getDownloadTaskList, stopDownloadTask, openDirectory, anysisRoomInfoFromLink, addRoom, addDownloadTask,
} from '@/render/common/ipcUtil';
import { RoomTypeOpts } from '@/common/eventConst';
import { formatMilliseconds } from '@/render/common/lib/date';

export default {
    data() {
        return {
            addDownloadModalFlag: false,
            addDownloadObj: {
                link: '',
            },
            downloadTasks: [],
        };
    },
    mounted() {
        this.initTasks();
        this.beginRefreshTimer();
    },
    unmounted() {
        this.stopRefreshTimer();
    },
    methods: {
        stopRefreshTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = undefined;
            }
        },
        beginRefreshTimer() {
            this.stopRefreshTimer();
            this.timer = setInterval(() => {
                this.initTasks();
            }, 2000);
        },
        parseTaskList(taskList) {
            this.downloadTasks = taskList.map((task) => {
                const {
                    roomInfo, size, beginTime, fileDir,
                } = task;
                return {
                    avatar: roomInfo.avatar,
                    owner: roomInfo.owner,
                    webRoomId: roomInfo.webRoomId,
                    secUserId: roomInfo.secUserId,
                    costTime: formatMilliseconds(Date.now() - beginTime),
                    fileSize: `${parseInt(size / 1024 / 1024, 10)}M`,
                    fileDir,
                };
            });
        },
        async initTasks() {
            console.log('刷新下载任务');
            const taskList = await getDownloadTaskList();
            console.log(taskList);
            this.parseTaskList(taskList);
        },
        refreshDownload() {
            this.initTasks();
        },
        showAddDownload() {
            this.addDownloadModalFlag = true;
        },
        async submitAddForm() {
            try {
                // 提交增加room
                console.log('分析room信息:', this.addDownloadObj);
                const roomInfo = await anysisRoomInfoFromLink(this.addDownloadObj.link);
                console.log('获取的roomInfo:', roomInfo);
                if (roomInfo && roomInfo.secUserId) {
                    // 添加roomInfo
                    const saveFlag = await addRoom(roomInfo);
                    if (saveFlag) {
                        this.$message({
                            message: '添加成功',
                            type: 'success',
                        });
                        this.closeAddDownloadDialog();
                        this.addDownloadObj.link = '';
                        await addDownloadTask(roomInfo.secUserId);
                        this.refreshDownload();
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
        closeAddDownloadDialog() {
            this.addDownloadModalFlag = false;
        },
        async stopTask(task) {
            const secUserId = task.secUserId;
            await stopDownloadTask(secUserId);
        },
        async openDir(task) {
            const fileDir = task.fileDir;
            await openDirectory(fileDir);
        },
        getType(type) {
            const typeMap = RoomTypeOpts.reduce((pre, item) => {
                pre[item.value] = item;
                return pre;
            }, {});
            return typeMap[type].label;
        },
    },
};
</script>
<style lang="scss" scoped>
.downloading-table{
    margin-top:20px;
}
.avatar{
  display: block;
  width:50px;
  height:50px;

}
</style>

<style>
.downloading-table  .cell {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
