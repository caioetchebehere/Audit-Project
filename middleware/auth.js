const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to authenticate JWT tokens - DISABLED
function authenticateToken(req, res, next) {
  // Authentication disabled - always allow access
  req.user = { id: 1, email: 'admin', role: 'admin' };
  next();
}

// Middleware to check if user is admin - DISABLED
function requireAdmin(req, res, next) {
  // Admin access always granted
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};

