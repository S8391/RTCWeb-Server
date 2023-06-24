const bcrypt = require('bcrypt');
const PasswordValidator = require('password-validator');


const passwordSchema = new PasswordValidator();
passwordSchema  //save time lets google this and modify for our purpose
  .is().min(8)                                     // Minimum length 8
  .is().max(100)                                   // Maximum length 100
  .has().uppercase()                               // Must have uppercase letters
  .has().lowercase()                               // Must have lowercase letters
  .has().digits(2)                                 // Must have at least 2 digits
  .has().not().spaces()                            // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']);  // Blacklist these values


async function hashPassword(password){
    if (!passwordSchema.validate(password)) {
        throw new Error('Password does not meet complexity requirements')
    }

    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function validatePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}


module.exports = {hashPassword, validatePassword};


