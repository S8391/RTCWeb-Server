const crypto = require('crypto');
const secret = crypto.randomBytes(120).toString('base64');
console.log(secret);


//generate 128 byte key, encode as base64 string