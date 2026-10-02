const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 1. Get User Notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT 50`,
      [req.user.id]
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Mark Single Notification as Read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notifId = req.params.id;
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notifId, req.user.id]);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Mark All Notifications as Read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
