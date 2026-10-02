const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Generate JWT token helper
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, department_id: user.department_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'citizen' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    // Role safety check: Citizens cannot register directly as admin
    const assignedRole = role === 'admin' ? 'citizen' : role;

    // Check existing
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, phone || null, assignedRole]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      role: assignedRole,
      department_id: null
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = await db.query(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Omit password hash
    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// Demo 1-Click Login (For fast evaluation, testing, and panel presentations)
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'citizen', email } = req.body;

    let targetEmail = email;
    if (!targetEmail) {
      switch (role.toLowerCase()) {
        case 'admin':
          targetEmail = 'admin@nexus.demo';
          break;
        case 'roads':
        case 'public_works':
          targetEmail = 'roads@nexus.demo';
          break;
        case 'sanitation':
          targetEmail = 'sanitation@nexus.demo';
          break;
        case 'water':
          targetEmail = 'water@nexus.demo';
          break;
        case 'electrical':
          targetEmail = 'electrical@nexus.demo';
          break;
        case 'citizen':
        default:
          targetEmail = 'citizen@nexus.demo';
          break;
      }
    }

    const users = await db.query(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ?`,
      [targetEmail]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, error: 'Demo user not found' });
    }

    const user = users[0];
    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: `Signed in as Demo ${user.name} (${user.role})`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, error: 'Demo login failed' });
  }
});

// Get Current Logged In User
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.department_id, u.avatar_url, u.created_at,
              d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List Demo Accounts (Public endpoint for presentation quick switcher)
router.get('/demo-accounts', async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email LIKE '%@nexus.demo'
       ORDER BY u.id ASC`
    );

    res.json({
      success: true,
      accounts: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
