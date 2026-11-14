<template>
  <div class="head-cut-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Crop /></el-icon>
          <span>一键批量裁切头像（headcut）</span>
        </div>
      </template>
      <el-form
        label-width="140px"
        class="head-cut-form"
      >
        <el-form-item label="待裁切图片目录">
          <el-input
            v-model="form.inputDir"
            placeholder="选择包含图片的目录, 支持递归处理子目录"
          >
            <template #append>
              <el-icon
                class="select-folder"
                color="#fece65"
                size="20"
                @click="selectFolder('inputDir')"
              >
                <Folder />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="裁切结果输出目录">
          <el-input
            v-model="form.outputDir"
            placeholder="裁切后的 1024x1024 头像将输出到该目录"
          >
            <template #append>
              <el-icon
                class="select-folder"
                color="#fece65"
                size="20"
                @click="selectFolder('outputDir')"
              >
                <FolderOpened />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="递归处理子目录">
          <el-switch v-model="form.recursive" />
          <el-text
            class="hint-text"
            type="info"
          >
            开启后会扫描输入目录下所有子文件夹中的图片
          </el-text>
        </el-form-item>
        <el-form-item label="输出尺寸（像素）">
          <el-input-number
            v-model="form.size"
            :min="64"
            :max="4096"
            :step="64"
          />
          <el-text
            class="hint-text"
            type="info"
          >
            输出正方形边长, LoRA 素材常用 1024
          </el-text>
        </el-form-item>
        <el-form-item label="裁切比例">
          <el-input-number
            v-model="form.scale"
            :min="1.2"
            :max="6"
            :step="0.1"
          />
          <el-text
            class="hint-text"
            type="info"
          >
            裁切边长 = 人脸框 × 该倍数, 调大包含更多上半身, 默认 2.6
          </el-text>
        </el-form-item>
        <el-form-item label="headcut 项目目录">
          <el-input
            v-model="form.headcutHome"
            placeholder="留空自动查找 (与本项目同级的 headcut 目录)"
          >
            <template #append>
              <el-icon
                class="select-folder"
                color="#fece65"
                size="20"
                @click="selectFolder('headcutHome')"
              >
                <Folder />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="running"
            @click="startCut"
          >
            一键裁切
          </el-button>
          <el-button
            type="danger"
            :disabled="!running"
            @click="stopCut"
          >
            停止
          </el-button>
          <el-button
            :disabled="!form.outputDir"
            @click="openOutput"
          >
            打开输出目录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="progress-card">
      <template #header>
        <div class="card-header">
          <span>裁切进度</span>
          <el-text
            v-if="stats.total"
            type="info"
          >
            共 {{ stats.total }} 张 / 已裁切 {{ stats.cropped }} / 无人脸 {{ stats.noFace }} / 失败 {{ stats.failed }}
          </el-text>
        </div>
      </template>
      <el-progress
        :percentage="percentage"
        :status="running ? '' : 'success'"
      />
    </el-card>

    <el-card class="result-card">
      <template #header>
        <div class="card-header">
          <span>裁切结果（{{ resultImages.length }} 张）</span>
          <div class="header-actions">
            <el-checkbox
              :model-value="allChecked"
              :indeterminate="indeterminate"
              @change="toggleAll"
            >
              全选
            </el-checkbox>
            <el-button
              size="small"
              type="danger"
              plain
              :disabled="!selectedNames.length"
              @click="batchDelete"
            >
              删除选中 ({{ selectedNames.length }})
            </el-button>
            <el-button
              size="small"
              @click="loadResultImages"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <el-empty
        v-if="!resultImages.length"
        description="还没有裁切结果, 选择目录后点击「一键裁切」"
      />
      <div
        v-else
        class="result-grid"
      >
        <div
          v-for="item in resultImages"
          :key="item.path"
          class="result-item"
        >
          <el-checkbox
            class="result-check"
            :model-value="selectedNames.includes(item.name)"
            @change="(checked) => toggleSelect(item.name, checked)"
          />
          <el-image
            :src="item.thumb"
            fit="cover"
            class="result-thumb"
            @click="previewImage(item)"
          >
            <template #placeholder>
              <div class="thumb-loading">
                加载中...
              </div>
            </template>
          </el-image>
          <el-popconfirm
            title="确定从输出目录删除这张图片?"
            confirm-button-text="删除"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="deleteImage(item)"
          >
            <template #reference>
              <el-icon class="result-del">
                <Delete />
              </el-icon>
            </template>
          </el-popconfirm>
          <div class="result-meta">
            <span
              class="result-name"
              :title="item.name"
            >
              {{ item.name }}
            </span>
            <span class="result-size">{{ formatSize(item.size) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-image-viewer
      v-if="viewerVisible"
      :url-list="[viewerUrl]"
      @close="viewerVisible = false"
    />
  </div>
</template>

<script>
import {
    selectDirectory,
    openDirectory,
    runHeadCut,
    stopHeadCut,
    listHeadCutImages,
    readHeadCutImage,
    deleteHeadCutFile,
} from '@/render/common/ipcUtil';
import { RenderReceiveEvents } from '@/common/eventConst';

const STORAGE_KEY = 'head-cut-form';

const defaultForm = () => ({
    inputDir: '',
    outputDir: '',
    headcutHome: '',
    size: 1024,
    scale: 2.6,
    recursive: true,
});

export default {
    data() {
        return {
            form: defaultForm(),
            running: false,
            percentage: 0,
            stats: {
                total: 0,
                cropped: 0,
                noFace: 0,
                failed: 0,
            },
            resultImages: [],
            selectedNames: [],
            viewerVisible: false,
            viewerUrl: '',
        };
    },
    computed: {
        allChecked() {
            return this.resultImages.length > 0
                && this.selectedNames.length === this.resultImages.length;
        },
        indeterminate() {
            return this.selectedNames.length > 0
                && this.selectedNames.length < this.resultImages.length;
        },
    },
    watch: {
        'form.outputDir': function (dir) {
            if (dir) {
                this.loadResultImages();
            } else {
                this.resultImages = [];
                this.selectedNames = [];
            }
        },
    },
    mounted() {
        this.loadForm();
        window.ipcRenderer.on(RenderReceiveEvents.HEAD_CUT_PROGRESS, this.onProgress);
        if (this.form.outputDir) {
            this.loadResultImages();
        }
    },
    beforeUnmount() {
        window.ipcRenderer.removeListener(
            RenderReceiveEvents.HEAD_CUT_PROGRESS,
            this.onProgress,
        );
    },
    methods: {
        loadForm() {
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (saved) {
                    this.form = { ...defaultForm(), ...saved };
                }
            } catch (err) {
                console.error('读取 headcut 配置失败', err);
            }
        },
        saveForm() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.form));
        },
        async selectFolder(key) {
            const ret = await selectDirectory();
            if (ret && !ret.canceled && ret.filePaths && ret.filePaths[0]) {
                this.form[key] = ret.filePaths[0];
                this.saveForm();
            }
        },
        resetProgress() {
            this.percentage = 0;
            this.stats = {
                total: 0,
                cropped: 0,
                noFace: 0,
                failed: 0,
            };
        },
        async startCut() {
            if (!this.form.inputDir) {
                this.$message.warning('请先选择待裁切图片目录');
                return;
            }
            if (!this.form.outputDir) {
                this.$message.warning('请先选择裁切结果输出目录');
                return;
            }
            this.saveForm();
            this.resetProgress();
            this.running = true;
            try {
                const result = await runHeadCut({ ...this.form });
                if (result && result.success === false && result.message) {
                    this.$message.error(result.message);
                }
            } catch (err) {
                this.$message.error(`裁切任务异常: ${err.message || err}`);
            } finally {
                this.running = false;
                await this.loadResultImages();
            }
        },
        async stopCut() {
            const ret = await stopHeadCut();
            if (ret && ret.message) {
                this.$message.warning(ret.message);
            }
        },
        async openOutput() {
            await openDirectory(this.form.outputDir);
        },
        async loadResultImages() {
            if (!this.form.outputDir) {
                this.resultImages = [];
                return;
            }
            const ret = await listHeadCutImages(this.form.outputDir);
            if (ret && ret.success) {
                this.resultImages = ret.images;
                this.selectedNames = this.selectedNames.filter((name) => this.resultImages
                    .some((item) => item.name === name));
            } else if (ret && ret.message) {
                this.$message.warning(ret.message);
            }
        },
        toggleSelect(name, checked) {
            if (checked) {
                if (!this.selectedNames.includes(name)) {
                    this.selectedNames.push(name);
                }
            } else {
                this.selectedNames = this.selectedNames.filter((item) => item !== name);
            }
        },
        toggleAll(checked) {
            this.selectedNames = checked ? this.resultImages.map((item) => item.name) : [];
        },
        async previewImage(item) {
            const ret = await readHeadCutImage(item.path, this.form.outputDir);
            if (ret && ret.success) {
                this.viewerUrl = ret.url;
                this.viewerVisible = true;
            } else {
                this.$message.error(ret && ret.message ? ret.message : '图片读取失败');
            }
        },
        async deleteImage(item) {
            const ret = await deleteHeadCutFile(item.path, this.form.outputDir);
            if (ret && ret.success) {
                this.resultImages = this.resultImages.filter((image) => image.path !== item.path);
                this.selectedNames = this.selectedNames.filter((name) => name !== item.name);
                this.$message.success(`已删除 ${item.name}`);
            } else {
                this.$message.error(ret && ret.message ? ret.message : '删除失败');
            }
        },
        async batchDelete() {
            if (!this.selectedNames.length) return;
            try {
                await this.$confirm(
                    `确定删除选中的 ${this.selectedNames.length} 张图片? 此操作不可恢复。`,
                    '批量删除确认',
                    {
                        confirmButtonText: '删除',
                        cancelButtonText: '取消',
                        type: 'warning',
                    },
                );
            } catch (err) {
                return;
            }
            const targets = this.resultImages.filter((item) => this.selectedNames.includes(item.name));
            const results = await Promise.all(
                targets.map((item) => deleteHeadCutFile(item.path, this.form.outputDir)),
            );
            const failed = results.filter((ret) => !ret || !ret.success);
            const deletedPaths = targets
                .filter((_, index) => results[index] && results[index].success)
                .map((item) => item.path);
            this.resultImages = this.resultImages
                .filter((item) => !deletedPaths.includes(item.path));
            this.selectedNames = [];
            if (failed.length) {
                this.$message.warning(`成功删除 ${deletedPaths.length} 张, ${failed.length} 张失败`);
            } else {
                this.$message.success(`已删除 ${deletedPaths.length} 张图片`);
            }
        },
        formatSize(bytes) {
            if (!bytes) return '';
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        },
        onProgress(payload) {
            if (!payload) return;
            if (typeof payload.percentage === 'number') {
                this.percentage = payload.percentage;
            }
            if (payload.stage === 'done') {
                this.percentage = 100;
                this.loadResultImages();
                if (payload.summary) {
                    this.$message.success(`裁切完成: ${payload.summary}`);
                }
            }
            if (typeof payload.total === 'number') {
                this.stats = {
                    total: payload.total || this.stats.total,
                    cropped: payload.cropped || 0,
                    noFace: payload.noFace || 0,
                    failed: payload.failed || 0,
                };
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.head-cut-container {
    .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
    }
    .hint-text {
        margin-left: 12px;
        font-size: 12px;
    }
    .select-folder {
        cursor: pointer;
    }
    .progress-card {
        margin-top: 20px;
    }
    .result-card {
        margin-top: 20px;
    }
    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .result-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
    }
    .result-item {
        position: relative;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;
        transition: box-shadow 0.2s;
        &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
    }
    .result-thumb {
        width: 100%;
        height: 180px;
        display: block;
        cursor: zoom-in;
        background: #f5f7fa;
    }
    .thumb-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #909399;
        font-size: 12px;
    }
    .result-check {
        position: absolute;
        top: 6px;
        left: 6px;
        z-index: 2;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.85);
    }
    .result-del {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 2;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        cursor: pointer;
        &:hover {
            background: #f56c6c;
        }
    }
    .result-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        font-size: 12px;
        color: #606266;
    }
    .result-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .result-size {
        flex-shrink: 0;
        color: #909399;
    }
}
</style>
