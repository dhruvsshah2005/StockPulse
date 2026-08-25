const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper to seed default admin user
async function ensureDefaultAdmin() {
  try {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      console.log('[Auth] Creating default Admin user (admin@stockpulse.ai / admin123)...');
      await User.create({
        name: 'Lead Merchandiser Admin',
        email: 'admin@stockpulse.ai',
        password: 'admin123',
        role: 'ADMIN'
      });
    }
  } catch (err) {
    console.warn('[Auth Notice]', err.message);
  }
}

// POST /auth/register - Create new user/admin account
router.post('/register', async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    const newUser = await User.create({
      name: name || 'Merchandiser User',
      email: cleanEmail,
      password: password,
      role: role || 'ADMIN'
    });

    const token = `token_user_${newUser._id}_${Date.now()}`;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = `token_admin_${user._id}_${Date.now()}`;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/users - List registered users in database
router.get('/users', async (req, res) => {
  try {
    await ensureDefaultAdmin();
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  try {
    await ensureDefaultAdmin();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No active admin token provided' });
    }

    const admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) return res.status(404).json({ error: 'Admin account not found' });

    res.json({
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
