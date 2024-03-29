export const formatMilliseconds = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours;

    let result = '';
    if (hours > 0) {
        result += `${hours}小时`;
    }
    if (minutes > 0) {
        result += `${minutes}分钟`;
    }
    if (seconds > 0) {
        result += `${seconds}秒`;
    }

    return result;
};

export const formatDate = (time) => {
    const date = new Date(); // 获取当前日期和时间
    if (time) {
        date.setTime(time);
    }

    const year = date.getFullYear(); // 获取年份
    let month = date.getMonth() + 1; // 获取月份，注意月份是从0开始的，所以需要+1
    let day = date.getDate(); // 获取日期
    let hours = date.getHours(); // 获取小时
    let minutes = date.getMinutes(); // 获取分钟
    let seconds = date.getSeconds(); // 获取秒

    // 如果月份、日期、小时、分钟和秒小于10，前面补0
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    const formattedDate = `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`; // 格式化日期和时间
    return formattedDate;
};
