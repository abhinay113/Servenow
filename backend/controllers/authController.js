const crypto = require('crypto');
const User = require('../models/User');

const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, phone, passwordHash: hash(password) });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email, passwordHash: hash(password) });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};