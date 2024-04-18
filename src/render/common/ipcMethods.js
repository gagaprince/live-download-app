import { dySign } from '@/render/common/lib/X-Bogus';

export default {
    xbogusSign: async (url, useragent) => {
        const ret = dySign(url, useragent);
        console.log('xbogusSign ret:', ret);
        return ret;
    },
};
