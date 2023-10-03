<template>
  <div class="select-filter">
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
          @click="check"
        >
          刷新
        </el-button>
      </el-col>
    </el-row>
  </div>
  <div class="save-table-list">
    <el-table
      :data="saveFileList"
      style="width: 100%;height:600px;"
    >
      <el-table-column type="expand">
        <template #default="props">
          <el-table
            :data="props.row.files"
            :border="true"
          >
            <el-table-column
              label="位置"
              prop="fileDir"
            />
            <el-table-column
              label="size"
              prop="size"
            />
            <el-table-column
              label="时间"
              prop="beginTime"
            />
            <el-table-column
              fixed="right"
              label="操作"
              width="200"
            >
              <template #default="scope">
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
        </template>
      </el-table-column>
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
    </el-table>
  </div>
</template>
<script>
import { openDirectory, getSaveFileList, reCheckFileList } from '@/render/common/ipcUtil';
import { formatDate } from '@/render/common/lib/date';

export default {
    data() {
        return {
            formObj: {
                owner: '',
                roomId: '',
            },
            saveFileList: [],
        };
    },
    mounted() {
        setTimeout(() => {
            this.initSaveFileList();
        }, 100);
    },
    methods: {
        async initSaveFileList() {
            const ret = await getSaveFileList();
            if (ret && ret.length > 0) {
                this.saveFileList = ret.map((fileObj) => {
                    const { roomInfo, files } = fileObj;
                    return {
                        ...roomInfo,
                        files: files.map((fileInfo) => ({
                            ...fileInfo,
                            size: `${parseInt(fileInfo.size / 1024 / 1024, 10)}M`,
                            beginTime: formatDate(fileInfo.beginTime),
                        })),
                    };
                });
            }
        },
        search() { },
        async check() {
            await reCheckFileList();
            this.initSaveFileList();
        },
        async openDir(task) {
            const fileDir = task.fileDir;
            await openDirectory(fileDir);
        },
    },

};
</script>
<style lang="scss" scoped>
.avatar{
  display: block;
  width:50px;
  height:50px;
}
.save-table-list{
    margin-top: 50px;
}
</style>
