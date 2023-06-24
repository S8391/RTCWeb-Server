const crypto = require('crypto');
const aesKey = crypto.randomBytes(32);
console.log(aesKey.toString('hex'));


//generate the aek key that will go in the .env    (use node gen-ken.js)    