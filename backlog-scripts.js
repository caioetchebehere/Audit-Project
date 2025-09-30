// Backlog Page JavaScript

// Global variables
let allAudits = [];
let filteredAudits = [];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the backlog page
    initializeBacklogPage();
    
    // Add loading animation
    addLoadingAnimation();
});

// Initialize backlog page
async function initializeBacklogPage() {
    try {
        // Load all audits
        await loadAllAudits();
        
        // Display audits
        displayAudits();
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Failed to initialize backlog page:', error);
        showNotification('Erro ao carregar auditorias. Tente novamente.', 'error');
    }
}

// Load all audits from localStorage and API
async function loadAllAudits() {
    allAudits = [];
    
    // Load from localStorage (simulated data for now)
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    
    companies.forEach(company => {
        const companyAudits = JSON.parse(localStorage.getItem(`${company}_audits`) || '[]');
        companyAudits.forEach(audit => {
            allAudits.push({
                ...audit,
                company: company,
                companyName: getCompanyDisplayName(company)
            });
        });
    });
    
    // Sort by date (newest first)
    allAudits.sort((a, b) => new Date(b.auditDate) - new Date(a.auditDate));
    
    // Set filtered audits to all audits initially
    filteredAudits = [...allAudits];
}

// Get company display name
function getCompanyDisplayName(company) {
    const names = {
        'carol': 'Carol',
        'grand-vision': 'Grand Vision',
        'sunglass-hut': 'SunglassHut'
    };
    return names[company] || company;
}

// Display audits in the list
function displayAudits() {
    const auditsList = document.getElementById('auditsList');
    if (!auditsList) return;
    
    // Clear existing content
    auditsList.innerHTML = '';
    
    if (filteredAudits.length === 0) {
        auditsList.innerHTML = `
            <div class="empty-audits">
                <p>Nenhuma auditoria encontrada.</p>
                <p>Faça upload de auditorias para vê-las aqui.</p>
            </div>
        `;
        return;
    }
    
    // Create audit items
    filteredAudits.forEach(audit => {
        const auditItem = createAuditItem(audit);
        auditsList.appendChild(auditItem);
    });
}

// Create individual audit item
function createAuditItem(audit) {
    const auditItem = document.createElement('div');
    auditItem.className = 'audit-item';
    auditItem.setAttribute('data-company', audit.company);
    auditItem.setAttribute('data-status', audit.status);
    auditItem.setAttribute('data-date', audit.auditDate);
    
    auditItem.innerHTML = `
        <div class="audit-header">
            <div class="audit-company">
                <span class="company-badge ${audit.company}">${audit.companyName}</span>
            </div>
            <div class="audit-date">${formatDate(audit.auditDate)}</div>
        </div>
        <div class="audit-content">
            <div class="audit-info">
                <div class="audit-filename">
                    <strong>${audit.filename}</strong>
                </div>
                <div class="audit-branch">
                    Filial: ${audit.branchNumber}
                </div>
                <div class="audit-description">
                    ${audit.description || 'Sem descrição'}
                </div>
            </div>
            <div class="audit-meta">
                <span class="audit-status ${audit.status}">${getStatusLabel(audit.status)}</span>
                <div class="audit-actions">
                    <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails('${audit.id}')">Ver Detalhes</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAudit('${audit.id}')" style="display: none;">Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    return auditItem;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'aprovada': 'Aprovada',
        'aprovada-com-aviso': 'Aprovada com aviso',
        'reprovada': 'Reprovada'
    };
    return labels[status] || status;
}

// Filter audits based on current filters
function filterAudits() {
    const brandFilter = document.getElementById('brandFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    filteredAudits = allAudits.filter(audit => {
        // Brand filter
        if (brandFilter !== 'all' && audit.company !== brandFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter !== 'all' && audit.status !== statusFilter) {
            return false;
        }
        
        // Date range filter
        if (dateFrom && new Date(audit.auditDate) < new Date(dateFrom)) {
            return false;
        }
        
        if (dateTo && new Date(audit.auditDate) > new Date(dateTo)) {
            return false;
        }
        
        return true;
    });
    
    // Display filtered audits
    displayAudits();
    
    // Update statistics
    updateStatistics();
}

// Clear all filters
function clearFilters() {
    document.getElementById('brandFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    // Reset to show all audits
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
}

// Refresh audits
async function refreshAudits() {
    showNotification('Atualizando auditorias...', 'info');
    await loadAllAudits();
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
    showNotification('Auditorias atualizadas!', 'success');
}

// Update statistics
function updateStatistics() {
    const totalAudits = filteredAudits.length;
    const aprovadas = filteredAudits.filter(a => a.status === 'aprovada').length;
    const aprovadasComAviso = filteredAudits.filter(a => a.status === 'aprovada-com-aviso').length;
    const reprovadas = filteredAudits.filter(a => a.status === 'reprovada').length;
    
    // Update display
    document.getElementById('totalAudits').textContent = totalAudits;
    document.getElementById('aprovadasCount').textContent = aprovadas;
    document.getElementById('aprovadasComAvisoCount').textContent = aprovadasComAviso;
    document.getElementById('reprovadasCount').textContent = reprovadas;
}

// View audit details
function viewAuditDetails(auditId) {
    const audit = allAudits.find(a => a.id === auditId);
    if (!audit) return;
    
    const details = `
        <strong>Empresa:</strong> ${audit.companyName}<br>
        <strong>Arquivo:</strong> ${audit.filename}<br>
        <strong>Data:</strong> ${formatDate(audit.auditDate)}<br>
        <strong>Filial:</strong> ${audit.branchNumber}<br>
        <strong>Status:</strong> ${getStatusLabel(audit.status)}<br>
        <strong>Descrição:</strong> ${audit.description || 'Sem descrição'}
    `;
    
    alert(details);
}

// Delete audit
function deleteAudit(auditId) {
    if (!confirm('Tem certeza que deseja excluir esta auditoria?')) {
        return;
    }
    
    // Remove from allAudits
    allAudits = allAudits.filter(a => a.id !== auditId);
    
    // Update localStorage
    const companies = ['carol', 'grand-vision', 'sunglass-hut'];
    companies.forEach(company => {
        const companyAudits = JSON.parse(localStorage.getItem(`${company}_audits`) || '[]');
        const updatedAudits = companyAudits.filter(a => a.id !== auditId);
        localStorage.setItem(`${company}_audits`, JSON.stringify(updatedAudits));
    });
    
    // Refresh display
    filteredAudits = [...allAudits];
    displayAudits();
    updateStatistics();
    
    showNotification('Auditoria excluída com sucesso!', 'success');
}

// Go back to dashboard
function goBack() {
    window.location.href = 'index.html';
}

// Add loading animation
function addLoadingAnimation() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}
