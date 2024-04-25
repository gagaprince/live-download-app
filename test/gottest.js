const got = require('got');

const url = 'https://api.bilibili.com/x/space/wbi/acc/info';
const searchParams = new URLSearchParams({
    mid: '407373225',
    token: '',
    platform: 'web',
    web_location: '1550101',
    dm_img_list: '[]',
    dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
    dm_cover_img_str: 'QU5HTEUgKEFUSSBUZWNobm9sb2dpZXMgSW5jLiwgQU1EIFJhZGVvbiBQcm8gNTU1WCBPcGVuR0wgRW5naW5lLCBPcGVuR0wgNC4xKUdvb2dsZSBJbmMuIChBVEkgVGVjaG5vbG9naWVzIEluYy',
    dm_img_inter: '{"ds":[],"wh":[2711,722,87],"of":[470,940,470]}',
    w_rid: '54df9213fe2f13a8510130d146d1989b',
    wts: '1713626985'
});

got(url, {
    searchParams,
    headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'max-age=0',
        'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    }
}).then(response => {
    console.log(response.body);
}).catch(error => {
    console.log(error.response.body);
});
