const got = require('got');
const axios = require('axios');
function test(){
    // //           https://www.xiaohongshu.com/discovery/item/660d0fbc000000001a0109c4?app_platform=ios&app_version=8.33&share_from_user_hidden=true&type=video&author_share=1&xhsshare=CopyLink&shareRedId=ODwyM0U9NT42NzUyOTgwNjZFOTdJNzxN&apptime=1714111692
    // const url = 'https://www.xiaohongshu.com/discovery/item/660d0fbc000000001a0109c4?app_platform=ios&app_version=8.33&share_from_user_hidden=true&type=video&author_share=1&xhsshare=CopyLink&shareRedId=ODwyM0U9NT42NzUyOTgwNjZFOTdJNzxN&apptime=1714111692';
    // const headers = {
    //     Host: 'www.xiaohongshu.com',
    //     cookie: 'abRequestId=566c2127-7c5b-5096-bbe8-f1bf47a60327; acw_tc=5ef866ed05632065096da83349c1a426b57a9d7a05e99da6e3d6826fd8a2b82e',
    //     accept: '*/*',
    //     'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    //     'cache-control': 'no-cache',
    // };
    // const arg1 = {
    //     headers, method:'GET'
    // };
    // got(url).then((ret)=>{
    //     console.log(ret.body);
    // });
    // axios.get(url,{
    //     headers: {
    //         Host: 'www.xiaohongshu.com',
    //         'Cookie': 'acw_tc=0d020cd808aa11df3ac32ee11f48e7493a71c944d7665c785494f51b8fda2011;'
    //     }
    axios.get('https://www.xiaohongshu.com/discovery/item/660d0fbc000000001a0109c4?app_platform=ios&app_version=8.33&share_from_user_hidden=true&type=video&author_share=1&xhsshare=CopyLink&shareRedId=ODwyM0U9NT42NzUyOTgwNjZFOTdJNzxN&apptime=1714111692', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        }
      }).then((ret)=>{
        console.log(ret.data);
        console.log(ret.status)
        console.log(ret.headers);

    })
}

test();