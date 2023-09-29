export class TaskList {
    taskList = [];

    maxLength = 1;

    doingTaskLength = 0;

    progressChangeListenerList = [];

    constructor(maxLength = 1) {
        this.maxLength = maxLength;
    }

    onProgressChange(callback) {
        this.progressChangeListenerList.push(callback);
    }

    doProgressChange() {
        this.progressChangeListenerList.forEach((fun) => {
            fun(this.taskList.length);
        });
    }

    add(task) {
        this.taskList.push(task);
        this.exec();
        return this;
    }

    exec() {
        if (this.doingTaskLength >= this.maxLength) return;
        const task = this.taskList.shift();
        if (task) {
            this.doingTaskLength += 1;
            const ret = task();
            if (ret instanceof Promise) {
                ret.finally(() => {
                    this.doingTaskLength -= 1;
                    this.doProgressChange();
                    this.exec();
                });
            } else {
                this.doingTaskLength -= 1;
                this.doProgressChange();
                this.exec();
            }
        }
    }
}
