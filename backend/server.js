const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, getDbType } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const issueRoutes = require('./routes/issues');
const departmentRoutes = require('./routes/departments');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure uploads folder exists and serve statically
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'NEXUS Intelligent Problem Resolution Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    databaseEngine: getDbType()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
// Serve static client build if available (for production / Render deployment)
const clientDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log('[NEXUS Server] Serving frontend production build from:', clientDistPath);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[NEXUS Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected error occurred on the server'
  });
});

// Start Server after DB is ready
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 NEXUS Backend API Server is running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🗄️ Database: ${getDbType().toUpperCase()} active`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

start();
