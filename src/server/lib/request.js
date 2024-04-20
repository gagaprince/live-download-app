import got from 'got';

export const request = ({
    url, data, method = 'GET', headers = {}, followRedirects = true, responseType = 'json', timeout = 10000,
}) => {
    const arg1 = {
        headers, followRedirect: !!followRedirects, method, timeout,
    };
    if (method === 'GET') {
        if (data) {
            arg1.searchParams = data;
        }
    } else {
        arg1.json = data;
    }
    return got(url, arg1).then((ret) => {
        if (responseType === 'json' && typeof ret.body === 'string') {
            try {
                ret.body = JSON.parse(ret.body);
            } catch (e) {
                console.error(e);
            }
        }
        return {
            data: ret.body,
            headers: ret.headers,
        };
    });
};
