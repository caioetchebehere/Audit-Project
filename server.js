// Check if running on Vercel FIRST - before any other imports
const isVercel = __dirname.includes('/var/task') || process.env.NODE_ENV === 'production';

// Force Vercel mode if we detect Vercel environment
if (isVercel) {
  console.log('FORCING VERCEL MODE - File system operations disabled');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Debug logging
console.log('Vercel detection:', {
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NOW_REGION: process.env.NOW_REGION,
  __dirname: __dirname,
  isVercel: isVercel,
  NODE_ENV: process.env.NODE_ENV
});

// Import routes
const authRoutes = require('./routes/auth');
const auditRoutes = require(isVercel ? './routes/vercel-audits' : './routes/audits');
const newsRoutes = require(isVercel ? './routes/vercel-news' : './routes/news');
const companyRoutes = require(isVercel ? './routes/vercel-companies' : './routes/companies');

// Import database initialization
const { initializeDatabase } = require(isVercel ? './database/vercel-init' : './database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads (only in non-Vercel environments)
if (!isVercel) {
  try {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    console.log('File system operations skipped:', error.message);
  }
} else {
  console.log('Skipping file system operations for Vercel environment');
  // For Vercel, we'll just return a 404 for uploads
  app.use('/uploads', (req, res) => {
    res.status(404).json({ error: 'File not found' });
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/companies', companyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: isVercel ? 'vercel' : 'local'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
if (isVercel) {
  // For Vercel, just initialize the database without starting a server
  initializeDatabase()
    .then(() => {
      console.log('Vercel function initialized successfully');
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
    });
} else {
  // For local development, start the server
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      });
    })
    .catch(err => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = app;
