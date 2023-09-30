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
