<template>
  <div class="video-corp-container">
    <div
      v-show="!videoSnapshot"
      class="video-frame"
      :style="{width: frameWidth+'px'}"
    >
      <video
        ref="myvideo"
        controls
      />
    </div>
    <div
      v-if="videoSnapshot"
      :style="{width:videoInfo.showWidth+'px', height:videoInfo.showHeight+'px'}"
    >
      <VueCropper
        ref="imgcorp"
        :fixed-number="fixedNumber"
        v-bind="imgCorpOptions"
        :img="videoSnapshot"
      />
    </div>
    <div
      v-if="!videoSnapshot"
      class="control-frame"
      @click="cutVideoSnapshot"
    >
      <el-icon><Crop /></el-icon>
    </div>
    <div
      v-if="videoSnapshot"
      class="control-frame"
      @click="returnVideoScene"
    >
      <el-icon><VideoCameraFilled /></el-icon>
    </div>
  </div>
</template>

<script>
import VueCropper from '@/render/components/imgCorp/vue-cropper.vue';

export default {
    components: {
        VueCropper,
    },
    props: {
        videoSrc: {
            type: String,
            default: '',
        },
        videoFile: {
            type: File,
            default: null,
        },
        frameWidth: {
            type: Number,
            default() {
                return 300;
            },
        },
        imgCorpOptions: {
            type: Object,
            default() {
                return {};
            },
        },
        fixedNumber: {
            type: Array,
            default: () => [1, 1],
        },
    },
    emits: ['onVideoInfoInit'],
    data() {
        return {
            videoInfo: {},
            videoSnapshot: '',
        };
    },
    watch: {
        videoSrc() {
            this.initVideoInfo();
        },
        videoFile() {
            this.initVideoInfo();
        },
    },
    mounted() {
        this.initVideoInfo();
    },
    methods: {
        initVideoInfo() {
            if (this.videoSrc || this.videoFile) {
                let videoSrc = this.videoSrc;
                if (this.videoFile) {
                    console.log(this.videoFile);
                    videoSrc = URL.createObjectURL(this.videoFile.raw);
                }
                const video = this.$refs.myvideo;
                video.src = videoSrc;
                video.load();

                video.onloadedmetadata = () => {
                    const width = video.videoWidth;
                    const height = video.videoHeight;
                    const showWidth = this.frameWidth;
                    const showHeight = (showWidth * height) / width;
                    this.videoInfo = {
                        duration: video.duration, // 视频时长
                        width, // 视频宽度
                        height, // 视频高度
                        showHeight,
                        showWidth,
                    };
                    console.log('videoInfo:', this.videoInfo);
                    this.$emit('onVideoInfoInit', this.videoInfo);
                };
            }
        },
        cutVideoSnapshot() {
            // 截图
            const video = this.$refs.myvideo;
            const canvas = document.createElement('canvas');
            canvas.width = this.videoInfo.width;
            canvas.height = this.videoInfo.height;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.videoSnapshot = canvas.toDataURL('image/png');
            // console.log('videoSnapshot:', this.videoSnapshot);
        },
        getCropBlobSelf(cb, width, height) {
            try {
                // console.log('videoSnapshot: ', this.videoSnapshot);
                if (this.videoSnapshot) {
                    this.$refs.imgcorp.getCropBlobSelf(cb, width, height);
                } else {
                    cb();
                }
            } catch (e) {
                console.error(e);
            } finally {
                cb();
            }
        },
        returnVideoScene() {
            this.videoSnapshot = '';
        },
    },
};
</script>

<style lang="scss" scoped>
    .video-frame{
        position:relative;
        width:300px;
        video{
            display: block;
            width:100%;
        }
    }
    .control-frame{
        position: absolute;
        left: 0;
        top: 0;
        width:30px;
        height: 30px;
        color:#fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0 0 5px 0;
        background: rgba(0,0,0,0.5);
        cursor: pointer;
    }
</style>
