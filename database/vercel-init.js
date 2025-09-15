// Vercel-compatible database initialization using in-memory storage
// This is a simplified version for serverless deployment

let db = {
  companies: [
    { id: 1, name: 'carol', display_name: 'Carol' },
    { id: 2, name: 'grand-vision', display_name: 'Grand Vision' },
    { id: 3, name: 'sunglass-hut', display_name: 'SunglassHut' }
  ],
  users: [
    { 
      id: 1, 
      email: 'admin@2025', 
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // audit@2025
      role: 'admin' 
    }
  ],
  audits: [],
  news: []
};

// Initialize database (for Vercel compatibility)
function initializeDatabase() {
  return new Promise((resolve) => {
    console.log('Vercel-compatible database initialized');
    console.log('Default admin credentials: admin@2025 / audit@2025');
    resolve();
  });
}

// Get database instance
function getDatabase() {
  return db;
}

// Close database connection (no-op for in-memory)
function closeDatabase() {
  return Promise.resolve();
}

// Helper functions for database operations
function findCompanyByName(name) {
  return db.companies.find(company => company.name === name);
}

function findUserByEmail(email) {
  return db.users.find(user => user.email === email);
}

function addAudit(audit) {
  const newAudit = {
    id: db.audits.length + 1,
    ...audit,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.audits.push(newAudit);
  return newAudit;
}

function getAudits(filters = {}) {
  let filteredAudits = [...db.audits];
  
  if (filters.company_id) {
    filteredAudits = filteredAudits.filter(audit => audit.company_id === filters.company_id);
  }
  
  if (filters.status) {
    filteredAudits = filteredAudits.filter(audit => audit.status === filters.status);
  }
  
  if (filters.date_from) {
    filteredAudits = filteredAudits.filter(audit => audit.audit_date >= filters.date_from);
  }
  
  if (filters.date_to) {
    filteredAudits = filteredAudits.filter(audit => audit.audit_date <= filters.date_to);
  }
  
  return filteredAudits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function addNews(news) {
  const newNews = {
    id: db.news.length + 1,
    ...news,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.news.push(newNews);
  return newNews;
}

function getNews() {
  return db.news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getCompanyStats() {
  const stats = {};
  
  db.companies.forEach(company => {
    const companyAudits = db.audits.filter(audit => audit.company_id === company.id);
    stats[company.name] = {
      totalAudits: companyAudits.length,
      aprovadas: companyAudits.filter(audit => audit.status === 'aprovada').length,
      aprovadasComAviso: companyAudits.filter(audit => audit.status === 'aprovada-com-aviso').length,
      reprovadas: companyAudits.filter(audit => audit.status === 'reprovada').length,
      lastAudit: companyAudits.length > 0 ? companyAudits[0].audit_date : null
    };
  });
  
  return stats;
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  findCompanyByName,
  findUserByEmail,
  addAudit,
  getAudits,
  addNews,
  getNews,
  getCompanyStats
};
