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

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
