import got from 'got';

export const request = ({
    url, data = {}, method = 'GET', headers = {}, followRedirects = true,
}) => {
    const arg1 = {
        headers, followRedirect: !!followRedirects, method,
    };
    if (method === 'GET') {
        arg1.searchParams = data;
    } else {
        arg1.json = data;
    }
    return got(url, arg1).then((ret) => {
        // console.log(ret);
        console.log('--------------body--------------');
        console.log(ret.body);
        console.log('--------------headers--------------');
        console.log(ret.headers);
        return {
            data: ret.body,
            headers: ret.headers,
        };
    });
};
