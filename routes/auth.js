const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDatabase, findUserByEmail } = require(process.env.VERCEL ? '../database/vercel-init' : '../database/init');

const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = process.env.VERCEL ? findUserByEmail(email) : await new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Create new admin user (for initial setup)
router.post('/create-admin', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = process.env.VERCEL ? findUserByEmail(email) : await new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      if (process.env.VERCEL) {
        // For Vercel, add to in-memory database
        const newUser = {
          id: Date.now(),
          email,
          password_hash: hashedPassword,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const db = getDatabase();
        db.users.push(newUser);
        
        res.json({
          message: 'Admin user created successfully',
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
          }
        });
      } else {
        // For local SQLite
        const db = getDatabase();
        db.run(
          'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
          [email, hashedPassword, 'admin'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }
            
            res.json({
              message: 'Admin user created successfully',
              user: {
                id: this.lastID,
                email,
                role: 'admin'
              }
            });
          }
        );
      }
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update admin password
router.put('/update-password', [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      // Get user
      const user = process.env.VERCEL ? 
        getDatabase().users.find(u => u.id === userId) :
        await new Promise((resolve, reject) => {
          const db = getDatabase();
          db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      if (process.env.VERCEL) {
        const db = getDatabase();
        const userIndex = db.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          db.users[userIndex].password_hash = hashedNewPassword;
          db.users[userIndex].updated_at = new Date().toISOString();
        }
        res.json({ message: 'Password updated successfully' });
      } else {
        const db = getDatabase();
        db.run(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedNewPassword, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update password' });
            }
            res.json({ message: 'Password updated successfully' });
          }
        );
      }
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

