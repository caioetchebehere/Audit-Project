const express = require('express');
const { getCompanyStats } = require('../database/vercel-init');

const router = express.Router();

// Get all companies
router.get('/', (req, res) => {
  try {
    const stats = getCompanyStats();
    const companies = Object.entries(stats).map(([name, companyStats]) => ({
      id: name === 'carol' ? 1 : name === 'grand-vision' ? 2 : 3,
      name: name,
      display_name: name === 'carol' ? 'Carol' : name === 'grand-vision' ? 'Grand Vision' : 'SunglassHut',
      total_audits: companyStats.totalAudits,
      approved_audits: companyStats.aprovadas,
      approved_with_warning_audits: companyStats.aprovadasComAviso,
      rejected_audits: companyStats.reprovadas,
      last_audit_date: companyStats.lastAudit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stats = getCompanyStats();
    
    let companyName = '';
    if (id === '1') companyName = 'carol';
    else if (id === '2') companyName = 'grand-vision';
    else if (id === '3') companyName = 'sunglass-hut';
    
    if (!companyName || !stats[companyName]) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const companyStats = stats[companyName];
    const company = {
      id: parseInt(id),
      name: companyName,
      display_name: companyName === 'carol' ? 'Carol' : companyName === 'grand-vision' ? 'Grand Vision' : 'SunglassHut',
      total_audits: companyStats.totalAudits,
      approved_audits: companyStats.aprovadas,
      approved_with_warning_audits: companyStats.aprovadasComAviso,
      rejected_audits: companyStats.reprovadas,
      last_audit_date: companyStats.lastAudit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company by name
router.get('/name/:name', (req, res) => {
  try {
    const { name } = req.params;
    const stats = getCompanyStats();
    
    if (!stats[name]) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const companyStats = stats[name];
    const company = {
      id: name === 'carol' ? 1 : name === 'grand-vision' ? 2 : 3,
      name: name,
      display_name: name === 'carol' ? 'Carol' : name === 'grand-vision' ? 'Grand Vision' : 'SunglassHut',
      total_audits: companyStats.totalAudits,
      approved_audits: companyStats.aprovadas,
      approved_with_warning_audits: companyStats.aprovadasComAviso,
      rejected_audits: companyStats.reprovadas,
      last_audit_date: companyStats.lastAudit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.json({ company });
  } catch (error) {
    console.error('Get company by name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company audits
router.get('/:id/audits', (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0, status } = req.query;
    
    // In Vercel version, return empty audits array
    res.json({ 
      audits: [],
      total: 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get company audits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
