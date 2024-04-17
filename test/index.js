const sign = require('./X-Bogus').sign;

const url = 'https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=MS4wLjABAAAA2qJpSW9YHmPvpZohGaTVbR-HHSo2aHazQlp4QHSBOEo&count=2&max_cursor=0&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333';
const urlQuery = url.split('?')[1]
const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';

const ret = sign(urlQuery, useragent)

console.log(ret)

const newurl = `${url}&X-Bogus=${ret}`
console.log(newurl);