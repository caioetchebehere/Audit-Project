// Vercel serverless function entry point
const express = require('express');
const path = require('path');
const cors = require('cors');

console.log('Loading Vercel function...');
console.log('Environment variables:', {
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NOW_REGION: process.env.NOW_REGION,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'vercel'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Vercel function is working!',
    timestamp: new Date().toISOString()
  });
});

// Test static file serving
app.get('/api/test-static', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const stylesPath = path.join(__dirname, '..', 'styles.css');
    const companyStylesPath = path.join(__dirname, '..', 'company-styles.css');
    
    const stylesExists = fs.existsSync(stylesPath);
    const companyStylesExists = fs.existsSync(companyStylesPath);
    
    res.json({
      message: 'Static file check',
      styles_css_exists: stylesExists,
      company_styles_css_exists: companyStylesExists,
      styles_path: stylesPath,
      company_styles_path: companyStylesPath
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Specific routes for static files
app.get('/styles.css', (req, res) => {
  console.log('Serving styles.css');
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'styles.css'));
});

app.get('/company-styles.css', (req, res) => {
  console.log('Serving company-styles.css');
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'company-styles.css'));
});

app.get('/scripts.js', (req, res) => {
  console.log('Serving scripts.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'scripts.js'));
});

app.get('/company-scripts.js', (req, res) => {
  console.log('Serving company-scripts.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'company-scripts.js'));
});

app.get('/backlog-scripts.js', (req, res) => {
  console.log('Serving backlog-scripts.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'backlog-scripts.js'));
});

app.get('/js/api.js', (req, res) => {
  console.log('Serving js/api.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'js', 'api.js'));
});

// API routes with error handling
try {
  app.use('/api/auth', require('../routes/auth'));
  app.use('/api/audits', require('../routes/vercel-audits'));
  app.use('/api/news', require('../routes/vercel-news'));
  app.use('/api/companies', require('../routes/vercel-companies'));
  console.log('API routes loaded successfully');
} catch (error) {
  console.error('Error loading API routes:', error);
}

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, '..'), {
  index: false, // Don't serve index.html automatically
  setHeaders: (res, path) => {
    console.log('Serving static file:', path);
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));

// Serve specific HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'main.html'));
});

app.get('/backlog.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'backlog.html'));
});

app.get('/carol.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'carol.html'));
});

app.get('/sunglass-hut.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sunglass-hut.html'));
});

app.get('/grand-vision.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'grand-vision.html'));
});

// Handle missing static files
app.use((req, res, next) => {
  console.log('Requested file not found:', req.path);
  next();
});

// Catch-all handler for SPA (must be last)
app.get('*', (req, res) => {
  console.log('Catch-all handler for:', req.path);
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
