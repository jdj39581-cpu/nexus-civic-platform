const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const aiEngine = require('../services/aiEngine');

// Setup multer for progress / resolution evidence
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 1. Get All Community Issues (with filtering & sorting)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      status,
      category,
      departmentId,
      priority,
      search,
      sortBy = 'priority', // priority, date, reports
      limit = 100,
      offset = 0
    } = req.query;

    let sql = `
      SELECT i.*, 
             c.name as category_name, c.icon as category_icon,
             d.name as department_name, d.code as department_code,
             u.name as assigned_resolver_name, u.email as assigned_resolver_email
      FROM issues i
      JOIN categories c ON i.category_id = c.id
      LEFT JOIN departments d ON i.department_id = d.id
      LEFT JOIN users u ON i.assigned_to_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      sql += ' AND (c.name = ? OR c.code = ?)';
      params.push(category, category);
    }

    if (departmentId && departmentId !== 'all') {
      sql += ' AND i.department_id = ?';
      params.push(parseInt(departmentId));
    }

    if (priority && priority !== 'all') {
      sql += ' AND i.priority_level = ?';
      params.push(priority);
    }

    if (search) {
      sql += ' AND (i.title LIKE ? OR i.description LIKE ? OR i.address LIKE ? OR i.issue_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sortBy === 'priority') {
      sql += ' ORDER BY i.priority_score DESC, i.id DESC';
    } else if (sortBy === 'reports') {
      sql += ' ORDER BY i.affected_reports_count DESC, i.id DESC';
    } else {
      sql += ' ORDER BY i.id DESC';
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const issues = await db.query(sql, params);

    res.json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (err) {
    console.error('Get issues error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get Single Issue Details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issueIdentifier = req.params.id;

    const issues = await db.query(
      `SELECT i.*, 
              c.name as category_name, c.icon as category_icon,
              d.name as department_name, d.code as department_code, d.contact_email as department_contact,
              u.name as assigned_resolver_name, u.email as assigned_resolver_email, u.phone as assigned_resolver_phone
       FROM issues i
       JOIN categories c ON i.category_id = c.id
       LEFT JOIN departments d ON i.department_id = d.id
       LEFT JOIN users u ON i.assigned_to_user_id = u.id
       WHERE i.id = ? OR i.issue_code = ?`,
      [issueIdentifier, issueIdentifier]
    );

    if (!issues || issues.length === 0) {
      return res.status(404).json({ success: false, error: 'Community Issue not found' });
    }

    const issue = issues[0];

    // 1. Fetch all connected citizen reports
    const linkedReports = await db.query(
      `SELECT r.id, r.report_code, r.title, r.description, r.photo_url, r.created_at,
              r.status, r.address, r.latitude, r.longitude, r.is_duplicate,
              u.name as reporter_name, u.email as reporter_email,
              ir.similarity_score
       FROM issue_reports ir
       JOIN reports r ON ir.report_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE ir.issue_id = ?
       ORDER BY r.id ASC`,
      [issue.id]
    );

    // 2. Fetch AI Analysis for this issue
    const aiData = await db.query(
      `SELECT * FROM ai_analysis WHERE issue_id = ? ORDER BY id DESC LIMIT 1`,
      [issue.id]
    );

    // 3. Fetch Status Timeline History
    const history = await db.query(
      `SELECT sh.*, u.name as changed_by_name, u.role as changed_by_role
       FROM status_history sh
       LEFT JOIN users u ON sh.changed_by_user_id = u.id
       WHERE sh.issue_id = ?
       ORDER BY sh.id ASC`,
      [issue.id]
    );

    // 4. Fetch Progress Updates
    const updates = await db.query(
      `SELECT pu.*, u.name as author_name, u.role as author_role
       FROM progress_updates pu
       JOIN users u ON pu.user_id = u.id
       WHERE pu.issue_id = ?
       ORDER BY pu.id DESC`,
      [issue.id]
    );

    // 5. Fetch Citizen Verifications / Feedback
    const feedbacks = await db.query(
      `SELECT f.*, u.name as citizen_name, u.email as citizen_email
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.issue_id = ?
       ORDER BY f.id DESC`,
      [issue.id]
    );

    // Parse JSON fields in aiData if available
    let parsedAi = null;
    if (aiData && aiData.length > 0) {
      parsedAi = {
        ...aiData[0],
        keywords: typeof aiData[0].keywords === 'string' ? JSON.parse(aiData[0].keywords || '[]') : aiData[0].keywords,
        location_references: typeof aiData[0].location_references === 'string' ? JSON.parse(aiData[0].location_references || '[]') : aiData[0].location_references,
        priority_reasons: typeof aiData[0].priority_reasons === 'string' ? JSON.parse(aiData[0].priority_reasons || '[]') : aiData[0].priority_reasons
      };
    }

    res.json({
      success: true,
      issue: {
        ...issue,
        reports: linkedReports,
        aiAnalysis: parsedAi,
        timeline: history,
        progressUpdates: updates,
        feedback: feedbacks
      }
    });
  } catch (err) {
    console.error('Get issue details error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Update Issue Status (Workflow transitions: Assigned -> In Progress -> Resolved -> Citizen Verified)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status, notes, resolutionNotes, resolutionProofUrl } = req.body;

    const allowedStatuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Citizen Verified', 'Closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value: ' + status });
    }

    const currentIssues = await db.query('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (!currentIssues || currentIssues.length === 0) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    const current = currentIssues[0];

    // Build update fields
    let updateSql = 'UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const updateParams = [status];

    if (status === 'Resolved') {
      updateSql += ', resolved_at = CURRENT_TIMESTAMP';
      if (resolutionNotes) {
        updateSql += ', resolution_notes = ?';
        updateParams.push(resolutionNotes);
      }
      if (resolutionProofUrl) {
        updateSql += ', resolution_proof_url = ?';
        updateParams.push(resolutionProofUrl);
      }
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(issueId);

    await db.query(updateSql, updateParams);

    // Also cascade status to all child reports
    await db.query('UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE issue_id = ?', [status, issueId]);

    // Insert into status_history
    await db.query(
      `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [issueId, current.status, status, req.user.id, notes || `Status updated to ${status}`]
    );

    // If marked Resolved, send notification to all reporting citizens requesting verification
    if (status === 'Resolved') {
      const reporters = await db.query('SELECT DISTINCT user_id FROM reports WHERE issue_id = ?', [issueId]);
      for (const rep of reporters) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, link_url)
           VALUES (?, ?, ?, 'warning', ?)`,
          [
            rep.user_id,
            'Action Needed: Verify Issue Resolution',
            `Issue ${current.issue_code} (${current.title}) was marked resolved by the department. Please verify if the problem is fixed!`,
            `/issues/${issueId}`
          ]
        );
      }
    }

    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      status
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Assign / Override Department or Resolver (Admin or Department Head)
router.put('/:id/assign', authenticateToken, requireRole(['admin', 'resolver']), async (req, res) => {
  try {
    const issueId = req.params.id;
    const { departmentId, assignedToUserId, notes } = req.body;

    const currentIssues = await db.query('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (!currentIssues || currentIssues.length === 0) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    const current = currentIssues[0];

    let updateSql = 'UPDATE issues SET updated_at = CURRENT_TIMESTAMP';
    const params = [];

    if (departmentId) {
      updateSql += ', department_id = ?';
      params.push(parseInt(departmentId));
    }

    if (assignedToUserId !== undefined) {
      updateSql += ', assigned_to_user_id = ?';
      params.push(assignedToUserId ? parseInt(assignedToUserId) : null);
    }

    // If issue was in Reported status, advance to Assigned
    if (current.status === 'Reported') {
      updateSql += ", status = 'Assigned'";
    }

    updateSql += ' WHERE id = ?';
    params.push(issueId);

    await db.query(updateSql, params);

    // Add status history
    await db.query(
      `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        issueId,
        current.status,
        current.status === 'Reported' ? 'Assigned' : current.status,
        req.user.id,
        notes || `Department/Resolver assignment updated by ${req.user.name}`
      ]
    );

    // Notify assigned resolver
    if (assignedToUserId) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, link_url)
         VALUES (?, ?, ?, 'info', ?)`,
        [
          assignedToUserId,
          'New Issue Assigned to You',
          `You have been assigned to handle issue ${current.issue_code} (${current.title}).`,
          `/issues/${issueId}`
        ]
      );
    }

    res.json({
      success: true,
      message: 'Issue department / resolver assignment updated successfully'
    });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Add Progress Update with Optional Evidence Photo
router.post('/:id/updates', authenticateToken, upload.single('evidence'), async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status, message, evidenceUrl: inputUrl } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Progress message is required' });
    }

    const proofUrl = req.file ? `/uploads/${req.file.filename}` : (inputUrl || null);

    // Insert progress update
    const result = await db.query(
      `INSERT INTO progress_updates (issue_id, user_id, status, message, evidence_url)
       VALUES (?, ?, ?, ?, ?)`,
      [issueId, req.user.id, status || 'In Progress', message, proofUrl]
    );

    // If status changed, update issue status
    if (status) {
      await db.query('UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, issueId]);
      await db.query('UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE issue_id = ?', [status, issueId]);
      await db.query(
        `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
         VALUES (?, NULL, ?, ?, ?)`,
        [issueId, status, req.user.id, `Progress update: ${message}`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Progress update recorded',
      updateId: result.insertId,
      evidenceUrl: proofUrl
    });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Citizen Verification (Yes resolved / No still exists)
router.post('/:id/verify', authenticateToken, upload.single('disputeEvidence'), async (req, res) => {
  try {
    const issueId = req.params.id;
    const { isResolvedConfirmed, comments, disputeEvidenceUrl: inputUrl } = req.body;

    const isConfirmed = isResolvedConfirmed === 'true' || isResolvedConfirmed === true || isResolvedConfirmed === 1;
    const evidenceUrl = req.file ? `/uploads/${req.file.filename}` : (inputUrl || null);

    const issues = await db.query('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (!issues || issues.length === 0) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    const issue = issues[0];

    // Save feedback record
    await db.query(
      `INSERT INTO feedback (issue_id, user_id, is_resolved_confirmed, comments, evidence_url)
       VALUES (?, ?, ?, ?, ?)`,
      [issueId, req.user.id, isConfirmed ? 1 : 0, comments || null, evidenceUrl]
    );

    if (isConfirmed) {
      // Citizen confirms resolution
      await db.query(
        `UPDATE issues 
         SET verified_by_citizen = 1, verification_status = 'Verified', 
             status = 'Citizen Verified', verification_notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [comments || 'Citizen confirmed issue resolution', issueId]
      );

      await db.query("UPDATE reports SET status = 'Citizen Verified' WHERE issue_id = ?", [issueId]);

      await db.query(
        `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
         VALUES (?, 'Resolved', 'Citizen Verified', ?, ?)`,
        [issueId, req.user.id, `Citizen confirmed resolution: ${comments || 'Verified by community'}`]
      );

      // Notify resolver
      if (issue.assigned_to_user_id) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, link_url)
           VALUES (?, ?, ?, 'success', ?)`,
          [
            issue.assigned_to_user_id,
            'Resolution Verified by Citizen!',
            `Great job! Citizen confirmed resolution for issue ${issue.issue_code}.`,
            `/issues/${issueId}`
          ]
        );
      }

      res.json({
        success: true,
        message: 'Thank you! You have verified this issue resolution.',
        status: 'Citizen Verified'
      });
    } else {
      // Citizen disputes resolution: Problem still exists!
      await db.query(
        `UPDATE issues 
         SET verified_by_citizen = 0, verification_status = 'Disputed', 
             status = 'In Progress', verification_notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [`Disputed: ${comments || 'Citizen states problem still exists'}`, issueId]
      );

      await db.query("UPDATE reports SET status = 'In Progress' WHERE issue_id = ?", [issueId]);

      await db.query(
        `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
         VALUES (?, 'Resolved', 'In Progress', ?, ?)`,
        [issueId, req.user.id, `Citizen disputed resolution: ${comments || 'Work incomplete'}`]
      );

      // Alert assigned resolver and admin!
      if (issue.assigned_to_user_id) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, link_url)
           VALUES (?, ?, ?, 'error', ?)`,
          [
            issue.assigned_to_user_id,
            'Urgent: Resolution Disputed by Citizen',
            `Citizen reported that issue ${issue.issue_code} still persists: "${comments}". Case re-opened.`,
            `/issues/${issueId}`
          ]
        );
      }

      res.json({
        success: true,
        message: 'Your dispute feedback has been logged. The issue has been re-opened for department action.',
        status: 'In Progress',
        verification_status: 'Disputed'
      });
    }
  } catch (err) {
    console.error('Citizen verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Admin Grouping / Merge Reports into Issue
router.post('/merge', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { targetIssueId, reportIds = [] } = req.body;

    if (!targetIssueId || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Target issue ID and array of report IDs required' });
    }

    const issues = await db.query('SELECT * FROM issues WHERE id = ?', [targetIssueId]);
    if (!issues || issues.length === 0) {
      return res.status(404).json({ success: false, error: 'Target issue not found' });
    }
    const targetIssue = issues[0];

    // Merge each report
    for (const rId of reportIds) {
      await db.query('UPDATE reports SET issue_id = ?, is_duplicate = 1 WHERE id = ?', [targetIssueId, rId]);
      await db.query(
        'INSERT OR IGNORE INTO issue_reports (issue_id, report_id, similarity_score) VALUES (?, ?, 0.95)',
        [targetIssueId, rId]
      );
    }

    // Recalculate total affected reports count
    const countRes = await db.query('SELECT COUNT(*) as cnt FROM issue_reports WHERE issue_id = ?', [targetIssueId]);
    const totalReports = countRes[0]?.cnt || 1;

    const newPriority = aiEngine.calculateAggregatedIssuePriority(
      totalReports,
      targetIssue.priority_score,
      targetIssue.priority_level === 'Critical'
    );

    await db.query(
      'UPDATE issues SET affected_reports_count = ?, priority_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [totalReports, newPriority, targetIssueId]
    );

    await db.query(
      `INSERT INTO status_history (issue_id, from_status, to_status, changed_by_user_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        targetIssueId,
        targetIssue.status,
        targetIssue.status,
        req.user.id,
        `Admin merged ${reportIds.length} related report(s) into this Community Issue`
      ]
    );

    res.json({
      success: true,
      message: `Successfully merged ${reportIds.length} report(s) into issue ${targetIssue.issue_code}`,
      totalReports,
      newPriority
    });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
