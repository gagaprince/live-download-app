const emojiRegex = require('emoji-regex');

const regex = emojiRegex();
const originalStr = 'Hello, 😊 how are you?';
const replacedStr = originalStr.replace(regex, '');
console.log(originalStr);
console.log(replacedStr); // 输出: Hello,  how are you?
