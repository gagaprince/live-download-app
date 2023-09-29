<template>
  <div>
    <el-progress
      :text-inside="true"
      :stroke-width="26"
      :percentage="progress"
    />
  </div>
</template>
<script>
import { TaskList } from './taskList';

export default {
    props: {
        tasks: {
            type: Array,
            default() {
                return [];
            },
        },
        count: {
            type: Number,
            default: 1,
        },
    },
    emits: ['complete'],
    data() {
        return {
            progress: 0,
        };
    },
    watch: {
        tasks() {
            this.initTaskList();
        },
    },
    mounted() {
        this.initTaskList();
    },
    methods: {
        initTaskList() {
            this.taskList = new TaskList(this.count);
            const tasks = this.tasks;
            const total = tasks.length;
            if (total === 0) { return; }
            this.taskList.onProgressChange((yu) => {
                this.progress = 100 - parseInt((yu * 100) / total, 10);
                if (this.progress === 100) {
                    this.$emit('complete');
                }
            });

            tasks.forEach((task) => {
                this.taskList.add(task);
            });
        },
    },
};
</script>
<style lang="scss" scoped>

</style>
