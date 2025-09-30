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

// Specific routes for static files
app.get('/styles.css', (req, res) => {
  console.log('Serving styles.css');
  res.sendFile(path.join(__dirname, '..', 'styles.css'));
});

app.get('/scripts.js', (req, res) => {
  console.log('Serving scripts.js');
  res.sendFile(path.join(__dirname, '..', 'scripts.js'));
});

app.get('/js/api.js', (req, res) => {
  console.log('Serving js/api.js');
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

// Catch-all handler for SPA (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
