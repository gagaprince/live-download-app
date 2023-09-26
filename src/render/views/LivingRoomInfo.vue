<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="6" >
                <el-input v-model="formObj.owner" placeholder="up主姓名" />
            </el-col>
            <el-col :span="6" >
                <el-input v-model="formObj.roomId" placeholder="直播间id" />
            </el-col>
            <el-col :span="6">
                <el-button type="primary">搜索</el-button>
                <el-button type="primary" @click="showAddRoomModal">新增</el-button>
            </el-col>
        </el-row>
        <div class="line">
        </div>
        <div>
            <el-table :data="roomInfos" style="width: 100%">
                <el-table-column sortable prop="roomId" label="房间号" width="180" />
                <el-table-column prop="avatar" label="头像"  width="180" />
                <el-table-column prop="owner" label="房主" width="180" />
                <el-table-column prop="desc" label="描述"  />
                <el-table-column fixed="right" label="操作" width="120">
                    <template #default>
                        <el-button link type="primary" size="small" @click="handleClick">Detail</el-button>
                        <el-button link type="primary" size="small">Edit</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-dialog v-model="addRoomModalFlag">
                <el-form ref="addRoomForm" :model="addRoomObj">
                    <el-form-item label="直播链接">
                        <el-input v-model="addRoomObj.link" ></el-input>
                    </el-form-item>
                    <el-form-item style="justify-content:center;">
                        <el-button type="primary" @click="submitAddForm">提交</el-button>
                        <el-button @click="closeAddRoomDialog">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>
<script>
import { searchRoomInfos } from '@/render/common/ipcUtil';
export default {
    data() { 
        return {
            roomInfos: [
                {
                    roomId: '12345', // 房间
                    owner: 'gagaprince', // up主
                    avatar: '', // 头像
                    desc: '', // 描述
                    link: '', // 链接
                    liveStatus: '', // 状态 0 未知 
                }
            ],
            formObj: {
                owner: '',
                roomId:'',
            },
            addRoomObj: {
                link: '',
            },
            addRoomModalFlag:false,
        }
    },
    mounted() {
        this.initRoomInfos();
    },
    methods: {
        async initRoomInfos() {
            this.roomInfos = await searchRoomInfos();
        },
        showAddRoomModal() {
            // 添加房间的弹窗
            this.addRoomModalFlag = true;
        },
        submitAddForm() {
            // 提交增加room
            console.log('分析room信息:', this.addRoomObj);
        },
        closeAddRoomDialog() {
            this.addRoomModalFlag = false;
         }
    }
}
</script>
<style lang="scss" scoped>
.line{
    width: 100%;
    height:1px;
    border-bottom: 1px dashed #ccc;
    margin: 30px 0;
}

</style>

