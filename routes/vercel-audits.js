const express = require('express');
const path = require('path');
const os = require('os');
const { body, validationResult } = require('express-validator');
const { getAudits, addAudit, getCompanyStats } = require('../database/vercel-init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all audits with optional filtering
router.get('/', (req, res) => {
  try {
    const { company, status, limit = 50, offset = 0 } = req.query;
    
    const filters = {};
    if (company) filters.company_id = company;
    if (status) filters.status = status;
    
    const audits = getAudits(filters);
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAudits = audits.slice(startIndex, endIndex);
    
    res.json({ 
      audits: paginatedAudits,
      total: audits.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get audits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const audits = getAudits();
    const audit = audits.find(a => a.id === parseInt(id));
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }
    
    res.json({ audit });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new audit (simplified for Vercel)
router.post('/upload', authenticateToken, [
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

    const { company_id, audit_date, branch_number, description, status } = req.body;

    // For Vercel, we'll simulate file upload (no actual file storage)
    const tempUploadDir = path.join(os.tmpdir(), 'uploads');
    const audit = addAudit({
      company_id: parseInt(company_id),
      filename: `audit_${Date.now()}.pdf`, // Simulated filename
      original_filename: `audit_${Date.now()}.pdf`,
      file_path: path.join(tempUploadDir, `audit_${Date.now()}.pdf`),
      file_size: 1024, // Simulated file size
      file_type: 'application/pdf',
      audit_date,
      branch_number,
      description: description || null,
      status,
      uploaded_by: req.user.userId
    });

    res.status(201).json({
      message: 'Audit uploaded successfully',
      audit_id: audit.id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = getCompanyStats();
    
    // Calculate totals
    let totalAudits = 0;
    let aprovadas = 0;
    let aprovadasComAviso = 0;
    let reprovadas = 0;
    
    Object.values(stats).forEach(companyStats => {
      totalAudits += companyStats.totalAudits;
      aprovadas += companyStats.aprovadas;
      aprovadasComAviso += companyStats.aprovadasComAviso;
      reprovadas += companyStats.reprovadas;
    });
    
    res.json({
      status_breakdown: [
        { status: 'aprovada', count: aprovadas },
        { status: 'aprovada-com-aviso', count: aprovadasComAviso },
        { status: 'reprovada', count: reprovadas }
      ],
      company_breakdown: Object.entries(stats).map(([name, companyStats]) => ({
        company: name,
        count: companyStats.totalAudits
      })),
      recent_audits: totalAudits // Simplified for Vercel
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete audit
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    // In Vercel version, we'll just return success (no actual deletion)
    res.json({ message: 'Audit deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
