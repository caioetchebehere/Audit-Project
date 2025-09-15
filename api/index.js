// Vercel serverless function entry point
console.log('Loading Vercel function...');
console.log('Environment variables:', {
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NOW_REGION: process.env.NOW_REGION,
  NODE_ENV: process.env.NODE_ENV
});

try {
  const app = require('../server');
  console.log('App loaded successfully');
  module.exports = app;
} catch (error) {
  console.error('Error loading app:', error);
  console.error('Error stack:', error.stack);
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Function initialization failed', 
      message: error.message,
      stack: error.stack
    });
  };
}
