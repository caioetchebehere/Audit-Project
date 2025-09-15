// Vercel serverless function entry point
console.log('Loading Vercel function...');

try {
  const app = require('../server');
  console.log('App loaded successfully');
  module.exports = app;
} catch (error) {
  console.error('Error loading app:', error);
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Function initialization failed', 
      message: error.message 
    });
  };
}
