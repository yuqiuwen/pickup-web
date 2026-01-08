import dayjs from 'dayjs';

export function formatTimestamp(ts?: number, format: string = 'YYYY-MM-DD HH:mm:ss') {
    if (!ts) {
        return '-';
    }
    return dayjs.unix(ts).format(format);
}