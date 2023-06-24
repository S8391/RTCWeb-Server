require('dotenv').config();
const jwt = require('jsonwebtoken');

function generateToken(user) {
    const payload = { id: user._id, username: user.username};
    return jwt.sign(payload, process.env.JWT_SECRET);
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (ex) {
        return null;
    }
}

module.exports = {generateToken, verifyToken };
