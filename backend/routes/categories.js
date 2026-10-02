const express = require('express');
const router = express.Router();
const db = require('../config/database');

// List All Categories
router.get('/', async (req, res) => {
  try {
    const categories = await db.query(
      `SELECT c.*, d.name as default_department_name
       FROM categories c
       LEFT JOIN departments d ON c.default_department_id = d.id
       ORDER BY c.id ASC`
    );

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
