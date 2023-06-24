const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256B 
const IV_LENGTH = 16; //FOR AES this is always 16


function encrypt(text){
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', buffer.from(ENCRYPTION_KEY), IV);
    let encrypted = cipher.update(text)

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + `:` + encrypted.toString('hex');
}


function decrypt(text) {
    let textParts = text.split(`:`);
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(`:`), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', buffer.from(ENCRYPTION_KEY), IV);
    let decrypted = decipher.update(encryptedText);


    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

module.export = {encrypt, decrypt};

