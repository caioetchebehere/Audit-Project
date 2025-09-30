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

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Vercel function is working!',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Test CSS file existence
app.get('/api/test-css', (req, res) => {
  const fs = require('fs');
  const stylesPath = path.join(__dirname, '..', 'styles.css');
  const companyStylesPath = path.join(__dirname, '..', 'company-styles.css');
  
  res.json({
    styles_css_exists: fs.existsSync(stylesPath),
    company_styles_css_exists: fs.existsSync(companyStylesPath),
    styles_path: stylesPath,
    company_styles_path: companyStylesPath
  });
});

// API routes (simplified for Vercel)
try {
  app.use('/api/auth', require('../routes/auth'));
  console.log('Auth routes loaded');
} catch (error) {
  console.error('Error loading auth routes:', error);
}

try {
  app.use('/api/audits', require('../routes/vercel-audits'));
  console.log('Audit routes loaded');
} catch (error) {
  console.error('Error loading audit routes:', error);
}

try {
  app.use('/api/news', require('../routes/vercel-news'));
  console.log('News routes loaded');
} catch (error) {
  console.error('Error loading news routes:', error);
}

try {
  app.use('/api/companies', require('../routes/vercel-companies'));
  console.log('Company routes loaded');
} catch (error) {
  console.error('Error loading company routes:', error);
}

// Serve CSS files with proper headers
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

// Serve JavaScript files
app.get('/scripts.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'scripts.js'));
});

app.get('/company-scripts.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'company-scripts.js'));
});

app.get('/backlog-scripts.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'backlog-scripts.js'));
});

app.get('/js/api.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'js', 'api.js'));
});

// Serve static files (images, etc.)
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'main.html'));
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

app.get('/backlog.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'backlog.html'));
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
