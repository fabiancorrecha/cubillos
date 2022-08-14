import moment from 'moment';

const range = (start: string, end: string, interval: number) => {
    var s = start.split(':').map((e: any) => +e);
    var e = end.split(':').map((e: any) => +e);
    var res = [];
    var t = [];
    while (!(s[0] == e[0] && s[1] > e[1])) {
        t.push(s[0] + ':' + (s[1] < 10 ? '0' +s[1] : s[1]));
        s[1] += interval;
        if (s[1] > 59) {
            s[0] += 1;
            s[1] %= 60;
        }
    }
    res.push(moment(start,'HH:mm:ss').format('HH:mm'));
    for (var i = 0; i < t.length - 1; i++) {
        res.push(t[i + 1]);
    }
    return res;
}

export const Range = range;