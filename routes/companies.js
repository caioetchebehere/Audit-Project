const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get all companies
router.get('/', (req, res) => {
  const db = getDatabase();

  db.all(`
    SELECT c.*, 
           COUNT(a.id) as total_audits,
           COUNT(CASE WHEN a.status = 'aprovada' THEN 1 END) as approved_audits,
           COUNT(CASE WHEN a.status = 'aprovada-com-aviso' THEN 1 END) as approved_with_warning_audits,
           COUNT(CASE WHEN a.status = 'reprovada' THEN 1 END) as rejected_audits,
           MAX(a.created_at) as last_audit_date
    FROM companies c
    LEFT JOIN audits a ON c.id = a.company_id
    GROUP BY c.id, c.name, c.display_name, c.created_at, c.updated_at
    ORDER BY c.display_name
  `, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ companies: rows });
  });
});

// Get company by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.get(`
    SELECT c.*, 
           COUNT(a.id) as total_audits,
           COUNT(CASE WHEN a.status = 'aprovada' THEN 1 END) as approved_audits,
           COUNT(CASE WHEN a.status = 'aprovada-com-aviso' THEN 1 END) as approved_with_warning_audits,
           COUNT(CASE WHEN a.status = 'reprovada' THEN 1 END) as rejected_audits,
           MAX(a.created_at) as last_audit_date
    FROM companies c
    LEFT JOIN audits a ON c.id = a.company_id
    WHERE c.id = ?
    GROUP BY c.id, c.name, c.display_name, c.created_at, c.updated_at
  `, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company: row });
  });
});

// Get company by name
router.get('/name/:name', (req, res) => {
  const { name } = req.params;
  const db = getDatabase();

  db.get(`
    SELECT c.*, 
           COUNT(a.id) as total_audits,
           COUNT(CASE WHEN a.status = 'aprovada' THEN 1 END) as approved_audits,
           COUNT(CASE WHEN a.status = 'aprovada-com-aviso' THEN 1 END) as approved_with_warning_audits,
           COUNT(CASE WHEN a.status = 'reprovada' THEN 1 END) as rejected_audits,
           MAX(a.created_at) as last_audit_date
    FROM companies c
    LEFT JOIN audits a ON c.id = a.company_id
    WHERE c.name = ?
    GROUP BY c.id, c.name, c.display_name, c.created_at, c.updated_at
  `, [name], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company: row });
  });
});

// Get company audits
router.get('/:id/audits', (req, res) => {
  const { id } = req.params;
  const { limit = 20, offset = 0, status } = req.query;
  const db = getDatabase();

  let query = `
    SELECT a.*, u.email as uploaded_by_email
    FROM audits a
    LEFT JOIN users u ON a.uploaded_by = u.id
    WHERE a.company_id = ?
  `;
  const params = [id];

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

module.exports = router;

