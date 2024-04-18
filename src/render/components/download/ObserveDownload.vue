<template>
  <div>
    <el-button
      type="primary"
      @click="refresh"
    >
      刷新
    </el-button>
  </div>
  <div style="margin-top:30px;">
    <el-table
      :data="roomInfos"
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
            @click="deleteRoom(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { getAllObserverDownloadTask, removeObserverDownload } from '@/render/common/ipcUtil';

export default {
    data() {
        return {
            roomInfos: [],
        };
    },
    mounted() {
        this.initObserveList();
    },
    methods: {
        async initObserveList() {
            this.roomInfos = await getAllObserverDownloadTask();
        },
        refresh() {
            this.initObserveList();
        },
        async deleteRoom(roomInfo) {
            await removeObserverDownload(roomInfo.secUserId);
            this.refresh();
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
