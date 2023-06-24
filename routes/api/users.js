const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../../models/user');
const { generateToken } = require('../../utils/token');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

router.post(
  '/register',
  limiter, // Apply rate limiting middleware
  [
    body('username').isString().notEmpty().trim().escape(),
    body('password').isString().notEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.exists({ username: { $regex: new RegExp(`^${escapeRegExp(username)}$`, 'i') } });
      if (existingUser) {
        return res.status(400).send('User already registered.');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();

      // Generate and return JWT
      const token = generateToken(user);
      res.header('x-auth-token', token).send({ username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/login',
  limiter, // Apply rate limiting middleware
  [
    body('username').isString().notEmpty().trim().escape(),
    body('password').isString().notEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Find user
      const user = await User.findOne({ username: { $regex: new RegExp(`^${escapeRegExp(username)}$`, 'i') } }).lean();
      if (!user) {
        return res.status(400).send('Invalid username or password.');
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).send('Invalid username or password.');
      }

      // Generate and return JWT
      const token = generateToken(user);
      res.header('x-auth-token', token).send({ username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = router;
