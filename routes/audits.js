const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { getDatabase, addAudit, getAudits, getCompanyStats } = require(process.env.VERCEL ? '../database/vercel-init' : '../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, XLS, XLSX, and CSV files are allowed'));
    }
  }
});

// Get all audits with optional filtering
router.get('/', (req, res) => {
  const { company, status, limit = 50, offset = 0 } = req.query;
  const db = getDatabase();

  let query = `
    SELECT a.*, c.display_name as company_name, u.email as uploaded_by_email
    FROM audits a
    JOIN companies c ON a.company_id = c.id
    LEFT JOIN users u ON a.uploaded_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (company) {
    query += ' AND c.name = ?';
    params.push(company);
  }

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ audits: rows });
  });
});

// Get audit by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.get(`
    SELECT a.*, c.display_name as company_name, u.email as uploaded_by_email
    FROM audits a
    JOIN companies c ON a.company_id = c.id
    LEFT JOIN users u ON a.uploaded_by = u.id
    WHERE a.id = ?
  `, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json({ audit: row });
  });
});

// Upload new audit
router.post('/upload', authenticateToken, upload.single('file'), [
  body('company_id').isInt({ min: 1 }),
  body('audit_date').isISO8601().toDate(),
  body('branch_number').notEmpty().trim(),
  body('status').isIn(['aprovada', 'aprovada-com-aviso', 'reprovada'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { company_id, audit_date, branch_number, description, status } = req.body;
    const db = getDatabase();

    // Insert audit record
    db.run(`
      INSERT INTO audits (
        company_id, filename, original_filename, file_path, file_size, file_type,
        audit_date, branch_number, description, status, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company_id,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      audit_date,
      branch_number,
      description || null,
      status,
      req.user.userId
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({
        message: 'Audit uploaded successfully',
        audit_id: this.lastID
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit statistics
router.get('/stats/overview', (req, res) => {
  const db = getDatabase();

  const queries = [
    // Total audits by status
    `SELECT status, COUNT(*) as count FROM audits GROUP BY status`,
    // Audits by company
    `SELECT c.display_name as company, COUNT(*) as count 
     FROM audits a 
     JOIN companies c ON a.company_id = c.id 
     GROUP BY c.id, c.display_name`,
    // Recent audits (last 30 days)
    `SELECT COUNT(*) as recent_count 
     FROM audits 
     WHERE created_at >= datetime('now', '-30 days')`
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  )).then(([statusStats, companyStats, recentStats]) => {
    res.json({
      status_breakdown: statusStats,
      company_breakdown: companyStats,
      recent_audits: recentStats[0].recent_count
    });
  }).catch(err => {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// Delete audit
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  // First get the file path to delete the physical file
  db.get('SELECT file_path FROM audits WHERE id = ?', [id], (err, audit) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    // Delete from database
    db.run('DELETE FROM audits WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Delete physical file
      fs.unlink(audit.file_path, (err) => {
        if (err) {
          console.error('File deletion error:', err);
        }
      });

      res.json({ message: 'Audit deleted successfully' });
    });
  });
});

module.exports = router;

