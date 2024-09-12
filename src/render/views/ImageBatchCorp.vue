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
          下载zip
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
            :key="index"
            class="preview-img-item"
            :style="{width: fileItem.imgInfo.showWidth+'px', height: fileItem.imgInfo.showHeight+'px'}"
          >
            <VueCropper
              :ref="'cropper_'+fileItem.uid"
              v-bind="corpOptions"
              :img="fileItem.imgInfo.src"
            />
          </div>
        </div>
      </el-col>
    </el-row>
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
                ratio: {
                    width: 1,
                    height: 1,
                },
                renameFormat: '',
                startIndex: 0,
            },
            corpOptions: {
                outputType: 'png',
                canScale: false,
                autoCrop: true,
                fixed: true,
                fixedNumber: [1, 1],
                canMove: false,
                limitMinSize: 1,
                centerBox: true,
                infoTrue: true,
                maxImgSize: 5000,
            },
            fileList: [],
            testImg: '',
        };
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
        download() {
            console.log('download1');
            const { uid } = this.fileList[0];
            console.log('uid:', uid);
            this.$refs[`cropper_${uid}`][0].getCropBlobSelf(async (data) => {
                console.log('data:', data);
                const zip = new JSZip();
                zip.file('1.png', data, { binary: true });
                const content = await zip.generateAsync({ type: 'blob' });
                this._downloadFile(content);
            }, 1024, 1024);
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
        clearImg() {
            this.fileList = [];
            // 清空上传列表
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
    }

    // .preview-img-item img {
    //     width: 100%;
    //     display: block;
    // }
</style>
