const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const aiEngine = require('../services/aiEngine');

// Setup multer storage for evidence images
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'));
  }
});

// Helper: Generate realistic tracking codes
function generateReportCode() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NXS-2026-00${rand}`;
}

function generateIssueCode() {
  const rand = Math.floor(100 + Math.random() * 900);
  return `ISS-2026-00${rand}`;
}

// 1. Instant AI Analysis Preview (Step 4 in Report wizard)
router.post('/analyze-preview', optionalAuth, async (req, res) => {
  try {
    const { title = '', description = '', category = '', latitude, longitude } = req.body;

    if (!title && !description) {
      return res.status(400).json({ success: false, error: 'Title or description required for AI analysis' });
    }

    // Step A: Natural Language Understanding
    const aiUnderstanding = aiEngine.analyzeText(title, description, category);

    // Step B: Similarity search with existing database reports
    let similarResults = { similarCount: 0, isPotentialDuplicate: false, matches: [] };
    if (latitude && longitude) {
      const existingReports = await db.query(
        `SELECT r.id, r.report_code, r.title, r.description, r.latitude, r.longitude, 
                r.category_id, r.status, r.issue_id, r.created_at, c.name as category_name
         FROM reports r
         JOIN categories c ON r.category_id = c.id
         WHERE r.status != 'Closed'
         ORDER BY r.id DESC LIMIT 100`
      );

      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      similarResults = aiEngine.findSimilarReports(
        { title, description, category_id: aiUnderstanding.category, latitude: latNum, longitude: lonNum },
        existingReports,
        800 // 800 meter radius
      );
    }

    // Step C: Look up recommended department details
    let recommendedDept = null;
    if (aiUnderstanding.recommendedDepartmentId) {
      const depts = await db.query('SELECT id, name, code FROM departments WHERE id = ?', [aiUnderstanding.recommendedDepartmentId]);
      if (depts && depts.length > 0) recommendedDept = depts[0];
    }

    res.json({
      success: true,
      analysis: {
        ...aiUnderstanding,
        recommendedDepartment: recommendedDept,
        similarity: similarResults
      }
    });
  } catch (err) {
    console.error('Analyze preview error:', err);
    res.status(500).json({ success: false, error: 'AI analysis failed: ' + err.message });
  }
});

// 2. Submit New Problem Report (Full end-to-end workflow)
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      categoryName,
      latitude,
      longitude,
      address,
      landmark,
      city = 'Bangalore',
      ward,
      photoUrl: inputPhotoUrl
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const lat = parseFloat(latitude) || 12.9250;
    const lon = parseFloat(longitude) || 77.4988;
    const reportCode = generateReportCode();
    const finalPhotoUrl = req.file ? `/uploads/${req.file.filename}` : (inputPhotoUrl || null);

    // Map Category
    let resolvedCategoryId = parseInt(categoryId);
    if (!resolvedCategoryId) {
      const cats = await db.query('SELECT id FROM categories WHERE name LIKE ? OR code LIKE ?', [
        `%${categoryName || 'Roads'}%`,
        `%${categoryName || 'roads'}%`
      ]);
      resolvedCategoryId = cats && cats.length > 0 ? cats[0].id : 1;
    }

    // 1. Run AI Understanding
    const aiResult = aiEngine.analyzeText(title, description, categoryName);

    // 2. Check for existing similar reports & duplicate detection
    const existingReports = await db.query(
      `SELECT r.id, r.report_code, r.title, r.description, r.latitude, r.longitude, 
              r.category_id, r.status, r.issue_id, r.created_at, c.name as category_name
       FROM reports r
       JOIN categories c ON r.category_id = c.id
       ORDER BY r.id DESC LIMIT 150`
    );

    const similarity = aiEngine.findSimilarReports(
      { title, description, category_id: resolvedCategoryId, latitude: lat, longitude: lon },
      existingReports,
      600
    );

    const isDuplicate = similarity.isPotentialDuplicate ? 1 : 0;
    const duplicateOfReportId = similarity.isPotentialDuplicate && similarity.topMatch ? similarity.topMatch.reportId : null;

    // 3. Issue Grouping Workflow: Link to existing Community Issue OR create new Community Issue
    let targetIssueId = null;
    let targetIssueCode = null;

    if (similarity.topMatch && similarity.topMatch.issueId) {
      // Group with existing community issue
      targetIssueId = similarity.topMatch.issueId;
      const existingIssues = await db.query('SELECT issue_code, affected_reports_count, priority_score FROM issues WHERE id = ?', [targetIssueId]);
      if (existingIssues && existingIssues.length > 0) {
        targetIssueCode = existingIssues[0].issue_code;
        const newCount = (existingIssues[0].affected_reports_count || 1) + 1;
        const recalculatedPriority = aiEngine.calculateAggregatedIssuePriority(
          newCount,
          existingIssues[0].priority_score || aiResult.priorityScore,
          aiResult.safetyRiskScore > 50
        );

        // Update community issue
        await db.query(
          `UPDATE issues 
           SET affected_reports_count = ?, priority_score = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [newCount, recalculatedPriority, targetIssueId]
        );
      }
    }

    // If no existing community issue matched, create a new Community Issue
    if (!targetIssueId) {
      targetIssueCode = generateIssueCode();
      const newIssueResult = await db.query(
        `INSERT INTO issues (
          issue_code, title, description, category_id, department_id, status,
          priority_score, priority_level, latitude, longitude, address, landmark,
          affected_reports_count
        ) VALUES (?, ?, ?, ?, ?, 'Reported', ?, ?, ?, ?, ?, ?, 1)`,
        [
          targetIssueCode,
          title,
          description,
          resolvedCategoryId,
          aiResult.recommendedDepartmentId,
          aiResult.priorityScore,
          aiResult.severity,
          lat,
          lon,
          address || 'RV College / Mysore Road area',
          landmark || null
        ]
      );
      targetIssueId = newIssueResult.insertId;
    }

    // 4. Insert Location record
    const locResult = await db.query(
      `INSERT INTO locations (address, landmark, latitude, longitude, ward, city) VALUES (?, ?, ?, ?, ?, ?)`,
      [address || 'Community Area', landmark || null, lat, lon, ward || 'Ward 132', city]
    );
    const locationId = locResult.insertId;

    // 5. Insert Report record
    const reportResult = await db.query(
      `INSERT INTO reports (
        report_code, user_id, issue_id, title, description, category_id,
        location_id, latitude, longitude, address, landmark, status,
        photo_url, is_duplicate, duplicate_of_report_id, priority_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Reported', ?, ?, ?, ?)`,
      [
        reportCode,
        req.user.id,
        targetIssueId,
        title,
        description,
        resolvedCategoryId,
        locationId,
        lat,
        lon,
        address || 'Community Area',
        landmark || null,
        finalPhotoUrl,
        isDuplicate,
        duplicateOfReportId,
        aiResult.priorityScore
      ]
    );
    const newReportId = reportResult.insertId;

    // 6. Link in issue_reports table
    await db.query(
      `INSERT INTO issue_reports (issue_id, report_id, similarity_score) VALUES (?, ?, ?)`,
      [targetIssueId, newReportId, similarity.topMatch ? (similarity.topMatch.compositeScore / 100) : 1.0]
    );

    // 7. Save AI Analysis record
    await db.query(
      `INSERT INTO ai_analysis (
        report_id, issue_id, category_detected, issue_type, severity,
        confidence, keywords, location_references, safety_risk_score,
        priority_score, priority_reasons, recommended_department_id,
        similar_reports_count, is_potential_duplicate, raw_analysis_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newReportId,
        targetIssueId,
        aiResult.category,
        aiResult.issueType,
        aiResult.severity,
        aiResult.confidence,
        JSON.stringify(aiResult.keywords),
        JSON.stringify(aiResult.locationReferences),
        aiResult.safetyRiskScore,
        aiResult.priorityScore,
        JSON.stringify(aiResult.priorityReasons),
        aiResult.recommendedDepartmentId,
        similarity.similarCount,
        isDuplicate,
        JSON.stringify({ aiResult, similarity })
      ]
    );

    // 8. Insert status history
    await db.query(
      `INSERT INTO status_history (issue_id, report_id, from_status, to_status, changed_by_user_id, notes)
       VALUES (?, ?, NULL, 'Reported', ?, ?)`,
      [targetIssueId, newReportId, req.user.id, 'Initial citizen report submitted via NEXUS']
    );

    // 9. Send Notification to citizen
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES (?, ?, ?, 'success', ?)`,
      [
        req.user.id,
        'Report Registered Successfully',
        `Your report ${reportCode} has been analyzed by NEXUS AI and mapped to Community Issue ${targetIssueCode}.`,
        `/issues/${targetIssueId}`
      ]
    );

    // Return comprehensive created payload
    res.status(201).json({
      success: true,
      message: 'Problem report submitted and analyzed successfully',
      report: {
        id: newReportId,
        reportCode,
        issueId: targetIssueId,
        issueCode: targetIssueCode,
        title,
        status: 'Reported',
        photoUrl: finalPhotoUrl,
        isDuplicate: Boolean(isDuplicate),
        aiAnalysis: {
          category: aiResult.category,
          issueType: aiResult.issueType,
          severity: aiResult.severity,
          confidence: aiResult.confidence,
          priorityScore: aiResult.priorityScore,
          reasons: aiResult.priorityReasons,
          recommendedDepartmentId: aiResult.recommendedDepartmentId,
          similarReportsNearby: similarity.similarCount
        }
      }
    });
  } catch (err) {
    console.error('Submit report error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit problem report: ' + err.message });
  }
});

// 3. Get Reports (with filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      userId,
      mine,
      status,
      category,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    let sql = `
      SELECT r.*, 
             c.name as category_name, c.icon as category_icon,
             u.name as reporter_name, u.email as reporter_email,
             i.issue_code, i.title as issue_title, i.status as issue_status,
             d.name as department_name
      FROM reports r
      JOIN categories c ON r.category_id = c.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN issues i ON r.issue_id = i.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (mine === 'true' && req.user) {
      sql += ' AND r.user_id = ?';
      params.push(req.user.id);
    } else if (userId) {
      sql += ' AND r.user_id = ?';
      params.push(userId);
    }

    if (status && status !== 'all') {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      sql += ' AND (c.name = ? OR c.code = ?)';
      params.push(category, category);
    }

    if (search) {
      sql += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.address LIKE ? OR r.report_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const reports = await db.query(sql, params);

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get Single Report
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const reports = await db.query(
      `SELECT r.*, 
              c.name as category_name, c.icon as category_icon,
              u.name as reporter_name, u.email as reporter_email,
              i.issue_code, i.title as issue_title, i.status as issue_status,
              d.name as department_name, d.code as department_code
       FROM reports r
       JOIN categories c ON r.category_id = c.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN issues i ON r.issue_id = i.id
       LEFT JOIN departments d ON i.department_id = d.id
       WHERE r.id = ? OR r.report_code = ?`,
      [reportId, reportId]
    );

    if (!reports || reports.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const report = reports[0];

    // Fetch AI Analysis
    const aiAnalysis = await db.query('SELECT * FROM ai_analysis WHERE report_id = ?', [report.id]);
    // Fetch History
    const history = await db.query(
      `SELECT sh.*, u.name as changed_by_name 
       FROM status_history sh 
       LEFT JOIN users u ON sh.changed_by_user_id = u.id 
       WHERE sh.report_id = ? 
       ORDER BY sh.id ASC`,
      [report.id]
    );

    res.json({
      success: true,
      report,
      aiAnalysis: aiAnalysis && aiAnalysis.length > 0 ? aiAnalysis[0] : null,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Nearby Reports by coordinates
router.get('/geo/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 2000 } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'lat and lon parameters are required' });
    }

    const centerLat = parseFloat(lat);
    const centerLon = parseFloat(lon);
    const maxRadius = parseFloat(radius);

    const allReports = await db.query(
      `SELECT r.id, r.report_code, r.title, r.latitude, r.longitude, r.status, r.priority_score,
              r.address, r.photo_url, c.name as category_name, c.icon as category_icon, r.issue_id
       FROM reports r
       JOIN categories c ON r.category_id = c.id
       LIMIT 200`
    );

    const nearby = allReports
      .map((r) => {
        const distance = aiEngine.calculateDistanceInMeters(centerLat, centerLon, r.latitude, r.longitude);
        return { ...r, distanceMeters: distance };
      })
      .filter((r) => r.distanceMeters <= maxRadius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      count: nearby.length,
      reports: nearby
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
