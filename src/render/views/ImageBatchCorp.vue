<template>
  <div class="img-corp-container">
    <el-row
      class="my-row"
      :gutter="24"
    >
      <el-col :span="6">
        <el-space>
          <el-text>
            width:
          </el-text>
          <el-input
            v-model="formObj.width"
            type="number"
            placeholder="宽"
          />
        </el-space>
      </el-col>
      <el-col :span="6">
        <el-space>
          <el-text>
            height:
          </el-text>
          <el-input
            v-model="formObj.height"
            type="number"
            placeholder="高"
          />
        </el-space>
      </el-col>
    </el-row>
    <el-row
      class="my-row"
      :gutter="24"
    >
      <el-col :span="12">
        <el-space>
          <el-text>
            重命名:
          </el-text>
          <el-input
            v-model="formObj.renameFormat"
            type="text"
            placeholder="文件命名 img-xxxx"
          />
          <el-text>
            开始下标:
          </el-text>
          <el-input
            v-model="formObj.startIndex"
            type="number"
            placeholder="文件命名 img-xxxx"
          />
        </el-space>
      </el-col>
      <el-col :span="3">
        <el-button
          type="primary"
          @click="download"
        >
          保存
        </el-button>
      </el-col>
      <el-col :span="3">
        <el-button
          type="primary"
          @click="clearImg"
        >
          清空
        </el-button>
      </el-col>
    </el-row>
    <el-row
      class="my-row"
      :gutter="24"
    >
      <el-col :span="24">
        <el-upload
          class="upload-demo"
          :auto-upload="false"
          drag
          multiple
          :show-file-list="false"
          @change="onFileChange"
        >
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            拖拽图片到这里 <em>或点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              图片文件大小小于100M
            </div>
          </template>
        </el-upload>
      </el-col>
    </el-row>
    <el-row
      class="my-row"
      :gutter="24"
    >
      <el-col :span="24">
        <div
          v-if="fileList.length>0"
          class="preview-img-list"
        >
          <div
            v-for="(fileItem, index) in fileList"
            :key="fileItem.uid"
            class="preview-img-item"
            :style="{width: fileItem.imgInfo.showWidth+'px', height: fileItem.imgInfo.showHeight+'px'}"
          >
            <VueCropper
              :ref="'cropper_'+fileItem.uid"
              v-bind="corpOptions"
              :fixed-number="fixedNumber"
              :img="fileItem.imgInfo.src"
            />
            <div
              class="del-frame"
              @click="deleteFile(index)"
            >
              <el-icon><Delete /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      v-model="showDialog"
      title="进度"
      width="500"
    >
      <div class="dialog-content">
        <el-progress
          type="circle"
          :percentage="progress"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import JSZip from 'jszip';
import VueCropper from '@/render/components/imgCorp/vue-cropper.vue';

export default {
    components: {
        VueCropper,
    },
    data() {
        return {
            previewImgWidth: 300,
            formObj: {
                width: 1024,
                height: 1024,
                renameFormat: '',
                startIndex: 0,
            },
            corpOptions: {
                outputType: 'png',
                canScale: false,
                autoCrop: true,
                fixed: true,
                canMove: false,
                limitMinSize: 1,
                centerBox: true,
                infoTrue: true,
                maxImgSize: 5000,
            },
            fileList: [],
            showDialog: false,
            progress: 0,
        };
    },
    computed: {
        fixedNumber() {
            const { width, height } = this.formObj;
            console.log('fixed,', width, height);
            return [width, height];
        },
    },
    methods: {
        readImgFile(file) {
            return new Promise((res, rej) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.raw);
                reader.onload = (e) => {
                    const base64Img = e.target.result;
                    const img = new Image();
                    img.src = base64Img;
                    img.onload = () => {
                        const { width, height } = img;
                        const showWidth = this.previewImgWidth;
                        const showHeight = (showWidth * height) / width;
                        const imgInfo = {
                            width: img.width,
                            height: img.height,
                            showWidth,
                            showHeight,
                            src: base64Img,
                        };
                        res(imgInfo);
                    };
                    img.onerror = (ex) => rej(ex);
                    // res(e.target.result); // 将图片的base64数据赋值给imageUrl
                };

                reader.onerror = (e) => rej(e);
            });
        },
        formatString(template, index) {
            // 将索引转换为字符串，并填充到4位数
            const xtmp = template.split('-')[1];
            if (xtmp) {
                const formattedIndex = String(index).padStart(xtmp.length, '0');
                return template.replace(xtmp, formattedIndex);
            }
            return template;
        },
        _downloadFile(content) {
            const aLink = document.createElement('a');
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('click', true, true); // initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
            aLink.download = `${Date.now()}.zip`;
            const binaryData = [];
            console.log(content);
            binaryData.push(content);
            aLink.href = window.URL.createObjectURL(new Blob(binaryData));
            aLink.click();
        },
        packageImg(fileInfo, idx, zip, width, height) {
            const { uid } = fileInfo;
            const renameFormat = this.formObj.renameFormat || 'image-xxxx';
            const fileNamePrefix = this.formatString(renameFormat, idx);
            return new Promise((res) => {
                this.$refs[`cropper_${uid}`][0].getCropBlobSelf(async (data) => {
                    zip.file(`${fileNamePrefix}.png`, data, { binary: true });
                    res();
                }, width, height);
            });
        },
        async download() {
            this.startPackageAndSave();
            const zip = new JSZip();
            const { width, height, startIndex } = this.formObj;
            for (let i = 0; i < this.fileList.length; i++) {
                const tmpFile = this.fileList[i];
                await this.packageImg(tmpFile, Number(i) + Number(startIndex), zip, width, height);
                this.setProgress((i * 100) / this.fileList.length);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            this.endPackageAndSave();
            this._downloadFile(content);
        },
        async onFileChange(file) {
            console.log('onFileChange file:', file);
            try {
                const imgInfo = await this.readImgFile(file);
                this.fileList.push({
                    uid: file.uid,
                    file,
                    imgInfo,
                });
            } catch (e) {
                console.error(e);
            }
        },
        startPackageAndSave() {
            this.setProgress(0);
            this.showDialog = true;
        },
        endPackageAndSave() {
            this.showDialog = false;
        },
        setProgress(val) {
            this.progress = parseInt(val, 10);
        },
        clearImg() {
            this.fileList = [];
            // 清空上传列表
            // this.showDialog = true;
        },
        deleteFile(fileIndex) {
            console.log(fileIndex);
            this.fileList.splice(fileIndex, 1); // 删除对应索引的文件
        },
    },
};
</script>

<style lang="scss" scoped>
    .img-corp-container{
        padding-bottom: 500px;
    }
    .my-row{
        margin-bottom: 20px;
    }
    .preview-img-list {
        //column-width: 300px;
        //column-gap: 50px;
        //counter-reset: count;
        // width: 1050px;
        // margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }

    .preview-img-item {
        position: relative;
        margin-bottom: 10px;
        // width: calc(100% / 4);
        margin-top:20px;
        background: red;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        // width:300px;
        // height: 300px;
        .del-frame{
            position: absolute;
            top:0;
            right:0;
            cursor: pointer;
            background: #4993fd;
            width:30px;
            height: 30px;
            border-radius: 0 0 5px 5px;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .dialog-content{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    // .preview-img-item img {
    //     width: 100%;
    //     display: block;
    // }
</style>
