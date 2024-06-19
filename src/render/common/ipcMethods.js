import { dySign } from '@/render/common/lib/X-Bogus';
import { dySignNew } from '@/render/common/lib/a_bogus';

let showVerifyLinkCallback;
export const addNeedShowVerifyLinkListener = (lis) => {
    showVerifyLinkCallback = lis;
};

export default {
    xbogusSign: async (url, useragent) => {
        const ret = dySign(url, useragent);
        console.log('xbogusSign ret:', ret);
        return ret;
    },
    abogusSign: async (url, useragent) => {
        const ret = dySignNew(url, useragent);
        console.log('abogusSign ret:', ret);
        return ret;
    },
    logRender: (str, type = 'log') => {
        console[type](`from-server:---${str}`);
    },
    renderVerifyLink: async (link, fp) => {
        if (showVerifyLinkCallback) {
            showVerifyLinkCallback(link, fp);
        }
    },
};
