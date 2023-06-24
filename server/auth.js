const express = require('express');
const router = express.Router();
const User = require('./models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ username });
  if (user) return res.status(400).send('User already registered.');

  // Create user
  user = new User({ username, password });
  await user.save();

  // Generate and return JWT
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('x-auth-token', token).send({ username: user.username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user
  let user = await User.findOne({ username });
  if (!user) return res.status(400).send('Invalid username or password.');

  // Validate password
  const validPassword = await user.validatePassword(password);
  if (!validPassword) return res.status(400).send('Invalid username or password.');

  // Generate and return JWT
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('x-auth-token', token).send({ username: user.username });
});

module.exports = router;
