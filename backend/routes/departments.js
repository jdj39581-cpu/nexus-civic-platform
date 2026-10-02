const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 1. List All Departments with Workload Stats
router.get('/', async (req, res) => {
  try {
    const departments = await db.query(
      `SELECT d.*,
              (SELECT COUNT(*) FROM issues i WHERE i.department_id = d.id AND i.status != 'Closed' AND i.status != 'Citizen Verified') as active_issues_count,
              (SELECT COUNT(*) FROM issues i WHERE i.department_id = d.id AND (i.status = 'Resolved' OR i.status = 'Citizen Verified')) as resolved_issues_count,
              (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) as staff_count
       FROM departments d
       ORDER BY d.id ASC`
    );

    res.json({
      success: true,
      departments
    });
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Department Resolver Assigned Cases (for Department / Resolver portal)
router.get('/my-cases', authenticateToken, requireRole(['resolver', 'admin']), async (req, res) => {
  try {
    const userDeptId = req.user.department_id;
    const { tab = 'all' } = req.query;

    let sql = `
      SELECT i.*, 
             c.name as category_name, c.icon as category_icon,
             d.name as department_name, d.code as department_code,
             u.name as assigned_resolver_name
      FROM issues i
      JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      LEFT JOIN users u ON i.assigned_to_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by department if resolver (admin sees all or filtered)
    if (req.user.role === 'resolver' && userDeptId) {
      sql += ' AND (i.department_id = ? OR i.assigned_to_user_id = ?)';
      params.push(userDeptId, req.user.id);
    }

    if (tab === 'new') {
      sql += " AND (i.status = 'Reported' OR i.status = 'Assigned')";
    } else if (tab === 'in_progress') {
      sql += " AND i.status = 'In Progress'";
    } else if (tab === 'resolved') {
      sql += " AND (i.status = 'Resolved' OR i.status = 'Citizen Verified')";
    } else if (tab === 'overdue') {
      // High or Critical priority not resolved in 2+ days
      sql += " AND (i.priority_score >= 80 AND i.status NOT IN ('Resolved', 'Citizen Verified', 'Closed'))";
    }

    sql += ' ORDER BY i.priority_score DESC, i.id DESC';

    const issues = await db.query(sql, params);

    // Also get quick counts for the tabs
    let deptFilterSql = '';
    const deptParams = [];
    if (req.user.role === 'resolver' && userDeptId) {
      deptFilterSql = ' AND (department_id = ? OR assigned_to_user_id = ?)';
      deptParams.push(userDeptId, req.user.id);
    }

    const newCount = await db.query(
      `SELECT COUNT(*) as c FROM issues WHERE status IN ('Reported', 'Assigned') ${deptFilterSql}`,
      deptParams
    );
    const inProgressCount = await db.query(
      `SELECT COUNT(*) as c FROM issues WHERE status = 'In Progress' ${deptFilterSql}`,
      deptParams
    );
    const overdueCount = await db.query(
      `SELECT COUNT(*) as c FROM issues WHERE priority_score >= 80 AND status NOT IN ('Resolved', 'Citizen Verified', 'Closed') ${deptFilterSql}`,
      deptParams
    );
    const resolvedCount = await db.query(
      `SELECT COUNT(*) as c FROM issues WHERE status IN ('Resolved', 'Citizen Verified') ${deptFilterSql}`,
      deptParams
    );

    res.json({
      success: true,
      counts: {
        new: newCount[0]?.c || 0,
        inProgress: inProgressCount[0]?.c || 0,
        overdue: overdueCount[0]?.c || 0,
        resolved: resolvedCount[0]?.c || 0
      },
      issues
    });
  } catch (err) {
    console.error('Get my cases error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Resolvers by Department (for admin assign dropdown)
router.get('/:id/resolvers', authenticateToken, async (req, res) => {
  try {
    const deptId = req.params.id;
    const resolvers = await db.query(
      'SELECT id, name, email, phone, role FROM users WHERE department_id = ? OR role = "resolver"',
      [deptId]
    );

    res.json({
      success: true,
      resolvers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
